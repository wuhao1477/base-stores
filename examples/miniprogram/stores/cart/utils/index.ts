const maxGoodsNum = 5; // 购物车最大限购数量

export function getCartKey(cartItem) {
  return cartItem.id;
}

export function checkGoodsStatus(cartItem) {
  console.log('cartItem', cartItem, cartItem.count > maxGoodsNum);
  const conditionList = {
    // 1004: (item) => item.goodsInfo.stock <= 0, // 售罄
    // 1001: (item) => item.goodsInfo.stock < item.count, // 库存不足
    1005: (item) => item.count > maxGoodsNum, // 库存不足
    1006: (item) => item.exist == false, //  下架
  };
  for (const key in conditionList) {
    const func = conditionList[key];
    if (func(cartItem)) {
      return key;
    }
  }
  return 0;
}

export function getCartError(code) {
  const errorList = {
    1001: { msg: '已达到最大可购数量' },
    1002: { msg: '购物车中没有该商品' },
    1003: { msg: '购物车中存在商品数量大于库存' },
    1004: { msg: '商品售罄' },
    1005: { msg: `同一商品最多只能加入${maxGoodsNum}件` },
    1006: { msg: '商品已下架' },
  };
  const error =
    code in errorList
      ? errorList[String(code)] || Object.values(errorList).find((it) => it.msg == code) || { msg: '', status: 0 }
      : { msg: code, status: '9999' };
  if (error?.msg) {
    console.error(error.msg);
  } else {
    error.msg = '';
  }
  return {
    ...error,
    status: code in errorList ? code : error.status,
  };
}