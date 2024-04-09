import BaseStore from '../utils/baseStores.js'

class Store extends BaseStore {

  data = {
    title: '首页',
    a: {
      b: {
        c() {
          return '嵌套节点也支持函数属性-' + this.title
        }
      }
    }
  }

}

module.exports = new Store();