import cartStore from '../../stores/cart/cartStore'

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    cartStore.bind(this, '$cart')
  },

  // 增加购物车
  addGoods(e){
    const goods = e.currentTarget.dataset.item
    cartStore.addCart({
      ...goods,
      count:1
    })
  },
  // 减少购物车
  cutGoods(e){
    const goods = e.currentTarget.dataset.item
    cartStore.cutCart({
      ...goods,
      count:1
    })
  },
  // 删除购物车
  delGoods(e){
    const goods = e.currentTarget.dataset.item
    cartStore.removeCart([goods])
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
})