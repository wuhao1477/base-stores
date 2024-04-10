import cartStore from '../../stores/cart/cartStore'

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    addGoodsId:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addGoods(){
      const addGoodsId = this.data.addGoodsId || Math.random().toString(32).slice(-8)
      const goods = {
        id: addGoodsId,
        goodsName: addGoodsId,
        count: 1
      }
      cartStore.addCart(goods)
    }
  }
})