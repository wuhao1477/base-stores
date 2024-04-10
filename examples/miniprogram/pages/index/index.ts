import cartStore from '../../stores/cart/cartStore'

// 获取应用实例
const app = getApp<IAppOption>()

Component({
  data: {
    addGoodsId:'',
    showDialog:false
  },
  lifetimes:{
    attached(){
      cartStore.bind(this, '$cart')
    }
  },
  methods: {
    addGoods(){
      const addGoodsId = this.data.addGoodsId || Math.random().toString(32).slice(-8)
      const goods = {
        id: addGoodsId,
        goodsName: addGoodsId,
        count: 1
      }
      cartStore.addCart(goods)
    },
    showDialog(){
      this.setData({
        showDialog:true
      })
    }
  },
})
