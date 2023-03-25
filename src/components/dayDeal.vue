<template>
    <div class="content">
        <div class="content-option content-btn">
            <el-button size="small" type="primary" shape="circle" @click="stop">暂停</el-button>
            <el-button size="small" type="primary" shape="circle" @click="start">启动</el-button>
        </div>
        <!-- <div class="content-option">
            调整杠杆:
            <Select v-model="leverage" slot="prepend" style="width: 80px" @on-change='setLeverage(leverage)'>
                <Option v-for="item in leverList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
        </div> -->
        <!-- <div class="content-option">
            自定义交易间隔:<Input  class="option-input" v-model="duration" ></Input>
        </div> -->
        <div class="content-option">
            每次交易数量:
            <el-select v-model="orderSize" slot="prepend" style="width: 80px">
                <el-option  v-for="item in orderSizeList" :value="item.value" :key="item.value">{{ item.label }}</el-option >
            </el-select>
        </div>
        <div class="content-tip"> {{accountInfo}}</div>
        <div :id="props.index" style="height:500px"></div>
        
        <div class="runInfo" v-html="runInfo"></div>
        
    </div>
</template>

<script setup>
import {ref, reactive, watch, computed, onMounted } from 'vue'
import {UserService} from '@/api/api.js'
import * as echarts from 'echarts'
import {toLocaleStringByMs} from '@/assets/js/utils-time.js'
const props = defineProps({
    index:{
        type: String,
        required: true, 
    },
    moudelType: {
        type: String,
        required: true, 
    },
    moudelRun: {
        type: Boolean,
        required: true, 
    },
    label:{
        type: String,
        default: ''
    }
})

console.log('1111111111111')
const emit = defineEmits(['changeRun'])
const dealParam = reactive({
    instId:'ETH-USDT',
    bar:'1D'
})
const echartsData = ref({})
const flag = ref(new Date().getHours())
const interval = ref({})
const duration = ref(10)
const intervalTime = ref(false)
const accountInfo = ref('')
const runInfo = ref('')
const currentPosition = ref(0)
const maxBuySize = ref(0)
const maxSellSize = ref(0)
const orderSize = ref(1)
const orderSizeList = ref([
    {
          value: 0.01,
          label: '0.01'
      },
      {
          value: 0.1,
          label: '0.1'
      },
      {
          value: 0.5,
          label: '0.5'
      },
      {
          value: 1,
          label: '1'
      },
      {
          value: 2,
          label: '2'
      },
      {
          value: 3,
          label: '3'
      },
      {
          value: 4,
          label: '4'
      },
      {
          value: 5,
          label: '5'
      },
      {
          value: 6,
          label: '6'
      },
        {
          value: 7,
          label: '7'
      },
  ])
  onMounted(() => {
    //初始化调用方法
    initParam()
    getETHDate()
    getCurrentTime()
  })

  watch( flag, (data, olddata) => {
    console.log('当前整点时间',new Date().toLocaleString());
    getETHDate("order")
  })

  watch( ()=> props.moudelRun, (data) => {
    setRun(data)
    initEcharts()
  })

  const initParam = () => {
      intervalTime.value = props.moudelRun; 
  }
  const getETHDate = (type) => {
      UserService.getEthDate(dealParam).then(result=>{
          let resultData = JSON.parse(JSON.stringify(result.data.data));
          echartsData.value = splitData(resultData.reverse());
          initEcharts();
          if(type && type==="order"){
            UserService.getPositions(dealParam).then(info=>{
                if(info.code==="0"){
                    let data = info.data[0];
                    if(data && data.pos) currentPosition.value = Number(data.pos);
                } 
            })
            setTimeout(computer(),1000)
          }
      })
  }
  /**
       * 初始化echarts表格
       */
  const initEcharts = (param) => {
      const myChart = echarts.init(document.getElementById(props.index))
      myChart.setOption({
              title: {
                  text: props.label + '   ETH趋势变化图'
              },
              tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                      type: 'cross'
                  }
              },
              xAxis: [{
                  data: [...echartsData.value.categoryData],
                  boundaryGap: false,
                  },
                  {
                  data: [...echartsData.value.categoryData],
                  gridIndex: 1
              }],
              yAxis: [{
                      scale: true,
                      splitArea: {
                          show: true
                      }
                  },    
                  {
                  gridIndex: 1
                  }
              ],
              grid: [
                      {
                      bottom: '40%'
                      },
                      {
                      top: '70%'
                      }
                  ],
              series: [
                  {
                      type: 'candlestick',
                      data: [...echartsData.value.values],
                      itemStyle: {
                      color: '#ec0000',
                      color0: '#00da3c',
                      borderColor: '#8A0000',
                      borderColor0: '#008F28'
                      },
                  },
                  {
                      name: '收盘价格',
                      type: 'line',
                      // stack: 'Total',
                      data: [...echartsData.value.closeData],
                      itemStyle:{
                          normal:{
                              color:'#fd4c4c',
                              lineStyle:{
                                  color:'#fd4c4c'
                              }
                          }
                      }
                  },
                  {
                      type: 'line',
                      showSymbol: false,
                      data: [...echartsData.value.rsi6Data],
                      xAxisIndex: 1,
                      yAxisIndex: 1
                  }
              ]
          })
      }
  const splitData = (rawData) => {
      let rsi6Data = getRsi(rawData);
      let categoryData = [];
      let values = [];
      let openData=[],closeData=[],highData=[],lowerData=[];
      for (var i = 0; i < rawData.length; i++) {
          let timetemp = Number(rawData[i].splice(0, 1)[0]);
          let time = toLocaleStringByMs(timetemp)
          categoryData.push(time);
          values.push([Number(rawData[i][0]),Number(rawData[i][3]),Number(rawData[i][1]),Number(rawData[i][2])]);
          openData.push(Number(rawData[i][0]));
          closeData.push(Number(rawData[i][3]));
          highData.push(Number(rawData[i][1]));
          lowerData.push(Number(rawData[i][2]));
          
      };
      return {
          categoryData,
          values,
          openData,
          closeData,
          highData,
          lowerData,
          rsi6Data
      };
  }
  const getRsi = (data) => {

      let perArr=[];
      for(let i =0;i<data.length-1;i++){
          let per = data[i+1][4]-data[i][4];
          perArr.push(per);
      }

      let rsiD1 = 6;

      //获取前几天的平均增益，作为计算移动平均的基础值
      let [rsJia,rsJian] = getRsiRag(perArr.splice(0,rsiD1-1));

      let res = new Array(rsiD1).fill(50);
      let i = 0 ;
      while(i<perArr.length){
          let per = perArr[i];
          if(per>0) {
              rsJia = (rsJia*(rsiD1-1) +per)/rsiD1;
              rsJian = rsJian*(rsiD1-1) /rsiD1;

          } else{
              rsJia = rsJia*(rsiD1-1) /rsiD1;
              rsJian = (rsJian*(rsiD1-1) +per)/rsiD1;
          }
          let rs = rsJia/ Math.abs(rsJian);
          var rsi = rs/(1+rs) *100;

          res.push(rsi);
          i++;
      }
      return res;

      }
  const getRsiRag = (perArr) => {
      let a1=0,b1=0;
      perArr.forEach(per => {
          if(per>0) {
              a1+=per;
          } else{
              b1+=per;
          }
      });
      let rsJia= a1/perArr.length;
      let rsJian = b1/perArr.length;
      return [rsJia,rsJian];
}

  const getCurrentTime = () => {
      setInterval(()=>{
          let date = new Date()
          let time = date.getHours();   
          let minu = date.getMinutes();
          
          if(time!==flag.value && minu>2){
              flag.value = time;
          }
      },1000*5)
  }
  const setRun = (flag) => {
      intervalTime.value = flag;
      console.log("index:intervalTime",props.index,flag)
  }
  const start = () => {
      let data = {"index":props.index,flag:true}
      emit('changeRun',data);
  }
  /**
   * 取消定时器
   */
  const stop = () => { 
      clearTimeout(interval.value);
      let data = {"index":props.index,flag:false}
      emit('changeRun',data);
  }
  /**
   * 每2个小时计算 是否要买入
   */
  const computer = () => {
    let len = echartsData.value.closeData.length;
    let per = (echartsData.value.closeData[len-2] - echartsData.value.closeData[len-3])/echartsData.value.closeData[len-3];


    if(!intervalTime.value ) return 
    
    if(per >= 0.06  ){
        // let sz = Math.round(this.maxBuySize*0.1);
        // if(sz<1) sz=1;
        let orderPx = (echartsData.value.closeData[len-2] - echartsData.value.lowerData[len-2]) *0.8 + this.echartsData.lowerData[len-2];
        let sz = Number(orderSize.value);
        order("buy",sz,echartsData.value.lowerData[len-2],orderPx); 
        
    }

    let str = "当前时间："+new Date().toLocaleDateString()+" "+new Date().toLocaleTimeString()
                +"  >>>>>>   "+ echartsData.value.categoryData[len-2] +"  收盘价格："+echartsData.value.closeData[len-2]
                +"  ------   "+ echartsData.value.categoryData[len-3] +"  收盘价格："+echartsData.value.closeData[len-3]
                +"  幅度："+per+"<br/>";
    runInfo.value+=str
    
  }

  const order = (type,sz,price) => {       
    let param ={
      "instId":"ETH-USDT",  
      "ordType":"limit",
      "tdMode":"cash",
      "px": orderPx,
      "side":type,   
      "sz":sz,
    };
    //设置止损价格
    param.slOrdPx= -1,
    param.slTriggerPx = slPx ;
    param.slTriggerPxType = "last" ;

    UserService.order(param).then(result=>{
      console.log('模拟交易成功',result)
    })
  }
</script>

<style lang='less' scoped>
.content{
    width: 45%;
    .content-title{
        display: flex;
        .content-option{
            display: flex;
            span{
                text-align: center;
                width: 120px;
                height: 32px;
                line-height: 32px;
            }
            .el-input{
                width: 100px;
            }
            .el-select{
                width: 80px;
            }
        }
    }
}
</style>