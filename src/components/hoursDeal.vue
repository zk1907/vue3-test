<template>
  <div class="content">
      <div class="content-title">
          <div class="content-option content-btn">
              <el-button size="small" type="primary" shape="circle" @click="stop">暂停</el-button>
              <el-button size="small" type="primary" shape="circle" @click="start">启动</el-button>
          </div>
          <div class="content-option">
              <span>调整杠杆:</span>
              <el-select v-model="leverage" slot="prepend" class="option-input" @change='setLeverage(leverage)'>
                  <el-option v-for="item in leverList" :value="item.value" :key="item.value" :label="item.label"></el-option>
              </el-select>
          </div>
          <div class="content-option">
              <span>自定义交易间隔:</span><el-input  class="option-input" v-model="duration" ></el-input>
          </div>
          <div class="content-option">
              <span>每次交易数量:</span>
              <el-select v-model="orderSize" slot="prepend" class="option-input">
                  <el-option v-for="item in orderSizeList" :value="item.value" :key="item.value" :label="item.label"></el-option>
              </el-select>
          </div>
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
    side: {
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

const emit = defineEmits(['changeRun'])
const dealParam = reactive({
  instId:'ETH-USDT-SWAP',
  bar:'2H'
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
const orderSize = ref(5)
const orderSizeList = ref([
    {
        value: '0.1',
        label: '0.1'
    },
    {
        value: 5,
        label: '0.5'
    },
    {
        value: 10,
        label: '1'
    },
    {
        value: 20,
        label: '2'
    },
    {
        value: 30,
        label: '3'
    },
    {
        value: 40,
        label: '4'
    },
    {
        value: 50,
        label: '5'
    },
  ])
const leverage = ref(50)
const leverList = ref([
    {
        value: '125.00',
        label: '125X'
    },
    {
        value: '100.00',
        label: '100X'
    },
    {
        value: '75.00',
        label: '75X'
    },
    {
        value: '50.00',
        label: '50X'
    },
    {
        value: '30.00',
        label: '30X'
    },
    {
        value: '20.00',
        label: '20X'
    },
    {
        value: '10.00',
        label: '10X'
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
                      data: [...echartsData.value.perData],
                      xAxisIndex: 1,
                      yAxisIndex: 1
                  }
              ]
          })
      }
  const formatter = (data) => {
          let param = [
              {
                  name: '开盘价格',
                  type: 'line',
                  // stack: 'Total',
                  data: data.data1.reverse(),
                  itemStyle:{
                      normal:{
                          color:'#00e9f9',
                          lineStyle:{
                              color:'#00e9f9'
                          }
                      }
                  }
              },
              {
                  name: '最高价格',
                  type: 'line',
                  // stack: 'Total',
                  data: data.data2.reverse(),
                  itemStyle:{
                      normal:{
                          color:'#fcae2b',
                          lineStyle:{
                              color:'#fcae2b'
                          }
                      }
                  }
              },
              {
                  name: '最低价格',
                  type: 'line',
                  // stack: 'Total',
                  data: data.data3.reverse(),
                  itemStyle:{
                      normal:{
                          color:'#0087ee',
                          lineStyle:{
                              color:'#0087ee'
                          }
                      }
                  }
              },
              {
                  name: '收盘价格',
                  type: 'line',
                  // stack: 'Total',
                  data: data.data4.reverse(),
                  itemStyle:{
                      normal:{
                          color:'#fd4c4c',
                          lineStyle:{
                              color:'#fd4c4c'
                          }
                      }
                  }
              }
          ]
          return param
      }
  const splitData = (rawData) => {
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

      let perData = getPerData(closeData);
      return {
        categoryData,
        values,
        openData,
        closeData,
        highData,
        lowerData,
        perData
      };
  }

  const getPerData = (data) => {
      let perArr=new Array(1).fill(0.02);

      for(let i =0;i<data.length-1;i++){
          let per = (data[i+1]-data[i])/data[i];
          perArr.push(per);
      }
    return perArr;
  }

  const getCurrentTime = () => {
      setInterval(()=>{
          let date = new Date()
          let time = date.getHours();   
          let minu = date.getMinutes();
          
          if(time%2 == 0 && minu>2){
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
   * 页面展示当前计算参数
   */
   const roteInfo = (per) => {
      let len = echartsData.value.closeData.length;
      let str = "当前时间："+new Date().toLocaleDateString()+" "+new Date().toLocaleTimeString()
              +"  >>>>>>   "+ echartsData.value.categoryData[len-2] +"  收盘价格："+echartsData.value.closeData[len-2]
              +"  ------   "+ echartsData.value.categoryData[len-3] +"  收盘价格："+echartsData.value.closeData[len-3]
              +"  当前仓位: "+ currentPosition.value
              +"  幅度："+per+"<br/>";
      runInfo+=str
  }
      /**
   * 页面展示当前下单参数
   */
  const roteInfoOrder = (param) => {
    let str = "下单成功 "+ JSON.stringify(param)+"<br/>";
    runInfo+=str
  }
  /**
   * 每2个小时计算 是否要买入
   */
  const computer = () => {
    let len = echartsData.value.closeData.length;
    let per = (echartsData.value.closeData[len-2] - echartsData.value.closeData[len-3])/echartsData.value.closeData[len-3];
    
    roteInfo(per)

    if(!intervalTime.value ) return 
    
    if(side==="buy" && per >= 0.02){
          
          // let sz = Math.round(this.maxBuySize*0.1);
          // if(sz<1) sz=1;
          let sz = Number(orderSize.value);
          order("buy",sz,echartsData.value.lowerData[len-2]); 
    }
    if(side==="sell" && per <= -0.02){
          // let sz = Math.round(this.maxSellSize*0.1);
          // if(sz<1) sz=1;
          let sz = Number(orderSize.value);
          order("sell",sz,echartsData.value.highData[len-2]);
    }
    
  }

  const order = (type,sz,price) => {       
    let param ={
        "instId":"ETH-USDT-SWAP",  
        "ordType":"market",
        "posSide": "net",
        "tdMode":"cross",
        "reduceOnly": "",
        "side":type,   
        "sz":sz,
    };
    //设置止损价格
    param.slOrdPx= -1,
    param.slTriggerPx = price ;
    param.slTriggerPxType = "last" ;

    UserService.order(param).then(result=>{
        roteInfoOrder(param);
        intervalTime.value = false;
        interval.value = setTimeout(function(){
            intervalTime.value = true;
        },60*1000*60*duration.value)
    })
  }
  /**
   * 获取最大可买卖数量
   */
  const getMaxSize = () =>{
    let param ={
        "instId":"ETH-USDT-SWAP",
        "tdMode":"cross",
        "ccy": "USDT"
    };
    UserService.getMaxSize(param).then(result=>{
        if(result.code==="0"){
          let data = result.data[0];
          maxBuySize.value = Number(data.maxBuy);
          maxSellSize.value = Number(data.maxSell);
          accountInfo.value = `当前账户：可用资金    预计可买入:${maxBuySize.value/10}ETH    预计可卖出:${maxSellSize.value/10}ETH`

        }
    })
  }
  /**
   * 设置杠杆倍数
   */
  const setLeverage = () => {
    let param ={
        "instId":"ETH-USDT-SWAP",
        "mgnMode": "cross",
        "lever": leverage.value
    };
    UserService.setLeverage(param).then(result=>{
        if(result.code==="0"){
          getMaxSize(result.data[0].lever);
        }
        
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