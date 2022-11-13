<template>
  <div>
    <div class="hoursList">
        <hoursDeal :index="data[0].index" :label='data[0].label' :side='data[0].side' :moudelRun='data[0].run' @changeRun='changeRun'></hoursDeal>
        <hoursDeal :index="data[1].index" :label='data[1].label' :side='data[1].side' :moudelRun='data[1].run' @changeRun='changeRun'></hoursDeal>
    </div>
    <div class="hoursList">
        <hoursDealRsi :index="data[3].index" :label='data[3].label' :side='data[3].side' :moudelRun='data[3].run' @changeRun='changeRun'></hoursDealRsi>
        <hoursDealRsi :index="data[4].index" :label='data[4].label' :side='data[4].side' :moudelRun='data[4].run' @changeRun='changeRun'></hoursDealRsi>
    </div>
    <div class="hoursList">
        <dayDeal :index="data[2].index" :label='data[2].label' :side='data[2].side' :moudelRun='data[2].run' @changeRun='changeRun'></dayDeal>
    </div>
  </div>
</template>
<script setup>
import hoursDealRsi from './hoursDealRsi.vue';
import hoursDeal from './hoursDeal.vue';
import dayDeal from './dayDeal.vue'
import { ref, reactive, onMounted} from 'vue'
const data = reactive( [
    {index:"0",text:'永续——做多--2小时',side:'buy',run:true},
    {index:"1",text:'永续——做空--2小时',side:'sell',run:false},
    {index:"2",text:'现货——做多--每天',side:'buy',run:true},
    {index:"3",text:'永续——做多--1小时',side:'buy',run:true},
    {index:"4",text:'永续——做空--1小时',side:'sell',run:true}
])

onMounted(() => {
  init()
})
const init = () => {
    data.forEach(item=>{
        item.run ?item.label =item.text+ ' >>> 启动中': item.label =item.text + ' >>> 暂停中';
    })

}
const changeRun = (info) => {
  debugger
    let index = data.findIndex(item=>{ return item.index===info.index})
    if(typeof(index)!=='undefined'){
        let item = data[index];
        item.run = info.flag;
        item.run === true ?item.label =item.text+ ' >>> 启动中': item.label = item.text + ' >>> 暂停中';
    }
}
</script>
<style scoped>
.hoursList{
    display: flex;
}
</style>
