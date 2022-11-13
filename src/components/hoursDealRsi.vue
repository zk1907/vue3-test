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
              <span>自定义交易间隔:</span><el-input class="option-input" v-model="duration" ></el-input>
          </div>
          <div class="content-option">
              <span>每次交易数量:</span>
              <el-select v-model="orderSize" slot="prepend" class="option-input">
                  <el-option v-for="item in orderSizeList" :value="item.value" :key="item.value" :label="item.label"></el-option>
              </el-select>
          </div>
          
      </div>
      <div class="content-title">
          <div class="content-option">
            <span>自定义RSI1:</span><el-input class="option-input" v-model="rsi1Num" ></el-input>
          </div>
          <!-- <div class="content-option">
              <span>自定义加减值:</span><el-input class="option-input" v-model="orderNum" ></el-input>
          </div> -->
          <div class="content-option">
            <span>止盈百分比:</span><el-input  class="option-input" v-model="orderPenTP" ></el-input>
          </div>
          <div class="content-option">
              <span>止损百分比:</span><el-input  class="option-input" v-model="orderPenSL" ></el-input>
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
  bar:'1H'
})
const echartsData = ref({})
const orderMarkers = ref({})
const flag = ref(new Date().getHours())
const interval = ref({})
const duration = ref(10)
const rsi1Num = ref(30)
const orderNum = ref(5)
const orderPenTP = ref(2.5)
const orderPenSL = ref(5)
const intervalTime = ref(false)
const accountInfo = ref('')
const runInfo = ref('')
const currentPosition = ref(0)
const maxBuySize = ref(0)
const maxSellSize = ref(0)
const orderSize = ref(5)
const orderSizeList = ref([
    {
        value: 1,
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
const cindex = ref()
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
      if(props.side==='buy'){
          rsi1Num.value = 30;
          orderNum.value = 5;
      }else if(props.side==='sell'){
          rsi1Num.value = 70;
          orderNum.value = 0;
      }
      intervalTime.value = props.moudelRun;    
  }
  //冲初始化接口数据
  const getETHDate =(type) => {
    UserService.getEthDate(dealParam).then(result=>{
        let resultData = JSON.parse(JSON.stringify(result.data));
        echartsData.value = splitData(resultData.data.reverse());
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
  const initEcharts = () => {
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
                },
                markPoint: {
                    label: {
                    formatter: function (param) {
                        return param != null ? Math.round(param.value) + '' : '';
                    }
                    },
                    data: orderMarkers.value,
                    tooltip: {
                    formatter: function (param) {
                        return param.name + '<br>' + (param.data.coord || '');
                    }
                    }
                },
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
//       /**
//        *
//        */
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
//       /**
//        * 添加定时器准点刷洗数据
//        */
  const getCurrentTime = () => {
    setInterval(()=>{
        let date = new Date()
        let time = date.getHours();   
        let minu = date.getMinutes();
        
        if(time%1 == 0 && minu>2){
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
    let curRsi1 = echartsData.value.rsi6Data[cindex.value];
    let str = "当前时间："+new Date().toLocaleDateString()+" "+new Date().toLocaleTimeString()
            +"  >>>>>>   "+ echartsData.value.categoryData[cindex.value] +"  收盘价格："+echartsData.value.closeData[cindex.value]
            +"  >>>>>>  "+ echartsData.value.categoryData[cindex.value-1] +"  收盘价格："+echartsData.value.closeData[cindex.value-1]
            +"  ------RSI1:"+curRsi1
            +"  ------当前仓位: "+currentPosition.value
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
      let len = echartsData.value.rsi6Data.length;
      cindex.value = len-2;
      let per = (echartsData.value.closeData[cindex.value] - echartsData.value.closeData[cindex.value-1])/echartsData.value.closeData[cindex.value-1];
      let curRsi1 = echartsData.value.rsi6Data[cindex.value];

      console.log( "程序是否启动"+intervalTime.value);
      roteInfo(per)

      if(!intervalTime.value ) return 

      if(side.value==="buy" && curRsi1<=rsi1Num.value && per>-0.3){
          //orderPx 交易价格 slPx 止损触发价 tpPx 止盈触发价
          let orderPx = echartsData.value.closeData[cindex.value]-orderNum.value;
          let slPx = orderPx*(1-0.01)
          let tpPx = orderPx*(1+0.015)
          let sz = Number(orderSize.value);
          order("buy",sz,slPx,orderPx,tpPx); 
      }

      if(side.value==="sell" && curRsi1>rsi1Num.value){
          //orderPx 交易价格 slPx 止损触发价 tpPx 止盈触发价
          let orderPx = echartsData.value.closeData[cindex.value]+orderNum.value;
          let slPx = orderPx*(1+0.01)
          let tpPx = orderPx*(1-0.015)
          let sz = Number(orderSize.value);
          order("sell",sz,slPx,orderPx,tpPx);
      }
  }
      /**
       * 买入做多
       */
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
    param.slTriggerPx = slPx ;
    param.slTriggerPxType = "last" ;

    //设置止盈价格
    param.tpOrdPx= -1,
    param.tpTriggerPx = tpPx ;
    param.tpTriggerPxType = "last" ;

    UserService.order(param).then(result=>{
        roteInfoOrder(param);
        let marker = {
            name: 'Mark',
            coord: [echartsData.value.categoryData[cindex.value], orderPx],
            value: orderPx,
            itemStyle: {
            color: 'rgb(41,60,85)'
            }
        }
        orderMarkers.value.push(marker)
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


//   },
      
// }
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