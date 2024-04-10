const TYPE_ARRAY: string = '[object Array]';
const TYPE_OBJECT: string = '[object Object]';
const TYPE_FUNCTION: string = '[object Function]';

function setComputed(storeData: any, value: any, obj: any, key: string): void {
  const type: string = getType(value);
  if (type === TYPE_FUNCTION) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function () {
        return value.call(storeData);
      },
      set: function () {
        console.warn('计算属性不支持重新赋值');
      }
    });
  } else if (type === TYPE_OBJECT) {
    Object.keys(value).forEach(subKey => {
      setComputed(storeData, value[subKey], value, subKey);
    });
  } else if (type === TYPE_ARRAY) {
    value.forEach((item: any, index: number) => {
      setComputed(storeData, item, value, index.toString()); // Convert index to string
    });
  }
}

function deepCopy(data: any): any {
  const type: string = getType(data);
  if (type === TYPE_OBJECT) {
    const obj: any = {};
    Object.keys(data).forEach(key => obj[key] = deepCopy(data[key]));
    return obj;
  }
  if (type === TYPE_ARRAY) {
    return data.map(deepCopy);
  }
  return data;
}

function getNowPage(): any {
  const pages: any[] = getCurrentPages();
  return pages[pages.length - 1];
}

function setState(vm: any, data: any): Promise<void> {
  vm._new_data = vm._new_data || {};
  Object.assign(vm._new_data, data);
  return new Promise(resolve => {
    Promise.resolve().then(() => {
      if (vm._new_data) {
        const diffState = getDiffState(vm._new_data, vm.data);
        vm._new_data = null;
        vm.setData(diffState, resolve);
      } else {
        resolve();
      }
    });
  });
}

function getDiffState(state: any, preState: any): any {
  const newState: any = {};
  stateDiff(deepCopy(state), preState, '', newState);
  return newState;
}

function getType(obj: any): string {
  return Object.prototype.toString.call(obj);
}

function addDiffState(newState: any, key: string, val: any): void {
  key !== '' && (newState[key] = val);
}

function stateDiff(state: any, preState: any, path: string, newState: any): void {
  if (state === preState) return;
  const stateType: string = getType(state);
  const preStateType: string = getType(preState);
  if (stateType === TYPE_OBJECT) {
    const stateKeys: string[] = Object.keys(state);
    const preStateKeys: string[] = Object.keys(preState || {});
    const stateLen: number = stateKeys.length;
    const preStateLen: number = preStateKeys.length;
    if (path !== '') {
      if (preStateType !== TYPE_OBJECT || stateLen < preStateLen || stateLen === 0 || preStateLen === 0) {
        addDiffState(newState, path, state);
        return;
      }
      preStateKeys.forEach(key => {
        if (state[key] === undefined) {
          state[key] = null; // 已删除的属性设置为null
          stateKeys.indexOf(key) === -1 && stateKeys.push(key);
        }
      });
    }
    stateKeys.forEach(key => {
      const subPath: string = path === '' ? key : path + '.' + key;
      stateDiff(state[key], preState[key], subPath, newState);
    });
    return;
  }
  if (stateType === TYPE_ARRAY) {
    if (preStateType !== TYPE_ARRAY || state.length < preState.length || state.length === 0 || preState.length === 0) {
      addDiffState(newState, path, state);
      return;
    }
    preState.forEach((item: any, index: number) => {
      state[index] === undefined && (state[index] = null); // 已删除的属性设置为null
    });
    state.forEach((item: any, index: number) => stateDiff(item, preState[index], path + '[' + index + ']', newState));
    return;
  }
  addDiffState(newState, path, state);
}

function getVmRoute(vm: any): string {
  return vm.route;
}

function getCurrentRoutes(): string[] {
  return getCurrentPages().map(f => getVmRoute(f));
}

function initComponent(vm: any): void {
  if (vm.route) return;
  const pageVm: any = vm.$page || vm.pageinstance || getNowPage() || {};
  vm.route = pageVm.route;
}

type IBindOptions = {
  includeKey?: string[]
  isComponent?: boolean
};

class Store {
  private __vms: { vm: any, key: string, options?: IBindOptions  }[];

  private __isReadyComputed: boolean = false;

  public data: any;

  private __delayTimer: any;
  private __proto__: any;

  constructor(options = {
    data:{}
  }) {
    const {
      data:{}
    } = options
    this.initStore(options);
    this.initOption.apply(this, [options]);
    this.__vms = [];
    setTimeout(() => {
      this._setComputed();
    }, 0);
  }

  initStore(options = {}) {

  }

  initOption(options = {
    data:{}
  }) {
    this.__proto__.data = options.data;
  }

  private _setComputed(): void {
    if (!this.__isReadyComputed) {
      this.__isReadyComputed = true;
      setComputed(this, this.data, this.data, '');
    }
  }

  public bind(vm: any, key: string, options:IBindOptions = {} ): void {
    if (!key) {
      console.error(`请设置store在当前组件实例data中的key，如store.bind(this, '$store')`);
      return;
    }
    const { isComponent = false } = options || {}
    vm.data = vm.data || {};
    // vm.data[key] = null;
    // console.log('this.__vms',this.__vms)
    this.__vms = this.__vms.filter(f => {
      //过滤掉已经卸载的组件
      if (f.vm._isComponent && !f.vm.pageinstance) {
        return false;
      }
      // 过滤掉已经绑定的组件
      if ((f.vm.route === vm.route && f.key === key || (f.vm.__wxWebviewId__ === vm.__wxWebviewId__ )) && !isComponent) {
        return false;
      }
      return true;
    }) || [];
    this._setComputed();
    this.__vms.push({ vm, key, options });
    console.log('this.getIncludeData(options?.includeKey)', this.getIncludeData(options?.includeKey))
    setState(vm, { [key]: this.getIncludeData(options?.includeKey) });
    setTimeout(() => initComponent(vm), 360);
  }

  public unbind(vm: any): void {
    this.__vms = (this.__vms || []).filter(f => f.vm !== vm);
  }

  public update(): void {
    const currRoutes: string[] = getCurrentRoutes();
    const nowVmRoute: string = currRoutes[currRoutes.length - 1];
    const delayVms: { vm: any, key: string }[] = [];
    // console.log("更新组件", this.__vms);
    (this.__vms || []).filter(f => {
      const vmRoute: string = getVmRoute(f.vm);
      if (nowVmRoute === vmRoute) {
        const { includeKey = [] } = f.options || {}
        setState(f.vm, { [f.key]: this.getIncludeData(includeKey) });
      } else { // 延迟更新
        delayVms.push(f);
      }
      return true;
    });

    if (!delayVms.length) return;
    // console.log("需要延迟更新的组件", delayVms);
    clearTimeout(this.__delayTimer);
    this.__delayTimer = setTimeout(() => {
      delayVms.forEach(f => setState(f.vm, { [f.key]: this.data }));
    }, 360);
  }

  private getIncludeData(includeKey:string[] = []){
    const obj = includeKey.length > 0 ? {} : this.data
    includeKey.forEach(val=>{
      obj[val] = this.data[val]
    })
    return obj
  }
}

export default Store;
