/*
 * @Author: O_qiancheng.chen
 * @Date: 2025-02-17 22:30:36
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-22 17:48:05
 * @Description: 请填写简介
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})
