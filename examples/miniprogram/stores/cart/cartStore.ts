import BaseStore from '@/utils/BaseStore';
import Cart from './models/index'

const STORAGE_KEY = 'cartList';
const maxGoodsNum = 5; // 购物车最大限购数量


class Store extends BaseStore {
  private model: any;

  constructor() {
    const cart = new Cart({
      onTick:()=>{
        this.updateView()
      }
    })
    super({
      data:cart
    });
    this.model = cart
  }

  updateView() {
    wx.setStorageSync(STORAGE_KEY, this.data.cartList);
    this.update();
  }

  // 网络请求更新购物车商品
  updateCartGoodsInfo() {
    if (this.data.cartList.length == 0) return Promise.reject();
    const cartList = this.data.cartList;
    const goodsKeys = cartList.map((it) => it.goods_id);

    return getApp()
      .API_common.getGoodsList(goodsKeys)
      .then((res) => {
        const newData = cartList.map((item) => {
          const goods_id = item.goods_id;
          const goodsInfo = res.find((it) => it.id == goods_id);
          if (goodsInfo) {
            return {
              ...item,
              goodsInfo: goodsInfo,
              exist: true,
            };
          }
          return {
            ...item,
            exist: false,
          };
        });
        this.data.cartList = newData.sort((a, b) => (b?.updateTime || 0) - (a?.updateTime || 0)); // 按照更新时间排序,最新的在最前面
        this.updateView();
        return newData;
      });
  }

  addCart(cart:any){
    this.model.addCart(cart)
  }

  cutCart(cart:any){
    this.model.cutCart(cart)
  }

  // 批量加入购物车
  batchAddCart(carts) {
    if (!Array.isArray(carts)) {
      console.error('传入的不是数组');
      return Promise.reject();
    }
    const taskArr = [];
    for (const [index, item] of carts.entries()) {
      if (carts.length - 1 == index) {
        taskArr.push(this.addCart(item, { isUpdateView: true }));
      } else {
        taskArr.push(this.addCart(item, { isUpdateView: false }));
      }
    }
    return Promise.race(taskArr);
  }

  // 修改购物车中的商品数量
  updateCart(cart, options = { isUpdateView: true }) {
    this.model.updateCart(...arguments)
  }

  // 批量更新购物车
  batchUpdateCart(carts) {
    if (!Array.isArray(carts)) {
      console.error('传入的不是数组');
      return Promise.reject();
    }
    const taskArr = [];
    for (const [index, item] of carts.entries()) {
      if (carts.length - 1 == index) {
        taskArr.push(this.updateCart(item, { isUpdateView: true }));
      } else {
        taskArr.push(this.updateCart(item, { isUpdateView: false }));
      }
    }
    return Promise.race(taskArr);
  }

  // 删除购物车中的商品
  removeCart(cart) {
    return this.model.removeCart(cart)
  }

  // 清空购物车
  clearCart() {
    return this.model.clearCart()
  }

  // 根据商品id获取购物车中的商品，如果没有则返回null
  getCartById(id) {
    const cartList = this.data.cartList;
    return cartList.find((item) => item.goods_id === id);
  }

  // 获取购物车中商品的数量
  getGoodsCount(id) {
    const goods = this.getCartById(id);
    return goods?.count;
  }

  // 获取购物车中商品的数量
  getCartCount() {
    return this.data.cartList.reduce((total, item) => total + item.count, 0);
  }

  // 获取购物车中选中的商品
  getCartSelect() {
    const cartList = this.data.cartList.filter((item) => checkGoodsStatus(item) == 0);
    return cartList.filter((item) => item.isSelect).sort((a, b) => (b?.updateTime || 0) - (a?.updateTime || 0));
  }

  // 获取购物车中选中的商品的数量
  getCartSelectCount() {
    return this.data.cartList.reduce((total, item) => {
      if (item.isSelect) {
        total += item.count;
      }
      return total;
    }, 0);
  }

  // 获取购物车中选中的商品的总价格
  getCartSelectPrice() {
    return this.data.cartList.reduce((total, item) => {
      if (item.isSelect) {
        total += item.count * item.goodsInfo.price;
      }
      return total;
    }, 0);
  }

  // 获取购物车中选中的商品的id列表
  getCartSelectIds() {
    return this.data.cartList.reduce((total, item) => {
      if (item.isSelect) {
        total.push(item.goods_id);
      }
      return total;
    }, []);
  }
}

const cartStore = new Store();
export default cartStore;
