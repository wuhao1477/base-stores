import { getCartKey, checkGoodsStatus, getCartError } from '../utils/index'

const STORAGE_KEY = 'cartList';

class Cart {
  private onTick: any;
  cartList: any;
  data: any;
  private __proto__: any;

  constructor(options = {onTick:()=>{}}) {
    const { onTick } = options;
    this.__proto__.onTick = onTick || (() => {});
    this.cartList = wx.getStorageSync(STORAGE_KEY) || [];
  }

    // 删除购物车中的商品
    removeCart(cart) {
      if (cart.length == 0) return;
      // 如果传入的是字符串，则表示传入的是购物车中商品的唯一的key的列表，否则传入的是商品对象
      if (typeof cart[0] === 'string') {
        const _cart = cart;
        this.cartList = this.cartList.filter((item) => _cart.indexOf(item.cartKey) === -1);
      } else {
        const _cart = cart;
        this.cartList = this.cartList.filter(
          (item) => _cart.findIndex((it) => it.cartKey === item.cartKey) === -1,
        );
      }
      this.onTick();
      return Promise.resolve();
    }

    // 添加商品到购物车
    cutCart(cart, options = { isUpdateView: true }) {
      let isUpdateView = options?.isUpdateView;
      isUpdateView ??= true;
      const newCartKey = getCartKey(cart);
      // 检测购物车中是否有该商品，有则数量加对应的数量，没有则添加
      let cartIndex = -1;
      // 函数重载
      if (typeof cart === 'string') {
        cartIndex = this.cartList.findIndex((item) => item.cartKey === cart);
      } else {
        cartIndex = this.cartList.findIndex((item) => item.cartKey === newCartKey);
      }

      if (cartIndex !== -1) {
        const goods = JSON.parse(JSON.stringify(this.cartList[cartIndex]));
        const goodsStatus = checkGoodsStatus({ ...goods, count: goods.count - cart.count });
        if (goodsStatus != 0) {
          console.log('商品状态异常');
          return Promise.reject(getCartError(goodsStatus));
        } else {
          this.cartList[cartIndex].count -= cart.count;
          this.cartList[cartIndex].updateTime = new Date().getTime();
          if(this.cartList[cartIndex].count <= 0){
            this.removeCart([cart])
          }
        }
      } else {
        const cartItem = Object.assign(cart, { cartKey: newCartKey, updateTime: new Date().getTime(), isSelect: true });
        cartIndex = this.cartList.length;
        this.cartList.push(cartItem);
      }
      console.log('添加购物车后更新视图');
      isUpdateView && this.onTick();
      return Promise.resolve(this.cartList[this.cartList.length - 1]);
    }

      // 添加商品到购物车
  addCart(cart, options = { isUpdateView: true }) {
    let isUpdateView = options?.isUpdateView;
    isUpdateView ??= true;
    const newCartKey = getCartKey(cart);
    // 检测购物车中是否有该商品，有则数量加对应的数量，没有则添加
    let cartIndex = -1;
    // 函数重载
    if (typeof cart === 'string') {
      cartIndex = this.cartList.findIndex((item) => item.cartKey === cart);
    } else {
      cartIndex = this.cartList.findIndex((item) => item.cartKey === newCartKey);
    }

    if (cartIndex !== -1) {
      const goods = JSON.parse(JSON.stringify(this.cartList[cartIndex]));
      const goodsStatus = checkGoodsStatus({ ...goods, count: goods.count + cart.count });
      if (goodsStatus != 0) {
        console.log('商品状态异常');
        return Promise.reject(getCartError(goodsStatus));
      } else {
        this.cartList[cartIndex].count += cart.count;
        this.cartList[cartIndex].updateTime = new Date().getTime();
      }
    } else {
      const cartItem = Object.assign(cart, { cartKey: newCartKey, updateTime: new Date().getTime(), isSelect: true });
      cartIndex = this.cartList.length;
      this.cartList.push(cartItem);
    }
    console.log('添加购物车后更新视图');
    isUpdateView && this.onTick();
    return Promise.resolve(this.cartList[this.cartList.length - 1]);
  }

    // 修改购物车中的商品数量
    updateCart(cart, options = { isUpdateView: true }) {
      let cartIndex = -1;
      // 函数重载
      if (typeof cart === 'string') {
        cartIndex = this.cartList.findIndex((item) => item.goods_id === cart);
      } else {
        cartIndex = this.cartList.findIndex((item) => item.goods_id === cart.goods_id);
      }
      if (cartIndex !== -1) {
        if (this.cartList[cartIndex].goodsInfo.stock >= cart.count) {
          this.cartList[cartIndex].count = cart.count;
        } else {
          return Promise.reject(getCartError(1001));
        }
      } else {
        return Promise.reject(getCartError(1002));
      }
      options?.isUpdateView && this.onTick();
      return Promise.resolve(cartIndex);
    }

      // 清空购物车
  clearCart() {
    this.cartList = [];
    this.onTick();
    return Promise.resolve();
  }
}

export default Cart;
