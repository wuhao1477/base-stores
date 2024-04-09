import BaseStore from '../utils/baseStores.js'

class Store extends BaseStore {

  data = {
    title: 'Hello页',
  }

  onChangeTitle() {
    this.data.title = 'Hello页' + Math.floor(Math.random() * 1000)
    this.update()
  }
}

module.exports = new Store();