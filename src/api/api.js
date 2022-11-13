import { request } from './axios'

/**
 * @description -封装User类型的接口方法
 */
export class UserService {       // 模块一
    /**
     * @description 用户登录
     * @param {string} username - 用户名
     * @return {HttpResponse} result
     */
    static async getEthDate(params) {   // 接口一
        return request('/api/v5/market/candles?after=&limit=60',params, 'GET')
    }
    static async getPositions(params) {
        return request('/api/v5/account/positions?',params, 'GET')
    }
    static async setLeverage(params) {
        return request('/api/v5/account/set-leverage?',params, 'POST')
    }
    static async getMaxSize(params) {
        return request('/api/v5/account/max-size?',params, 'GET')
    }
    static async order(params) {
        return request('/api/v5/trade/order?',params, 'POST')
    }
    static async login2(params) {   // 接口二
        return request('/login',params, 'post')
    }
    static async login3(params) {   // 接口三
        return request('/login',params, 'post')
    }
}

export class landRelevant {     // 模块二
    /**
     * @description 获取地列表
     * @return {HttpResponse} result
     */
    static async landList(params) {
        return request('/land_list_info',params, 'get')
    }
}

/**
//      * 查看持仓信息
//      * /v5/account/positions?instId=ETH-USDT-SWAP
//      */
//  getPositions(param){
//     return $.restAjax.action({
//         url: '/v5/account/positions?instId=' + param.instId,
//         type: 'GET',
//         root:'/api'
//     });
// },