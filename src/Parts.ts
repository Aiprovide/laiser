import "Promise";
//import $ from "jquery";
//import * as jQuery from "jquery";
import "jquery-ui-bundle";
import "jquery-treetable";
import "datatables.net";
import {Common} from "sp-com";

//
// Binded data
//
export class BData<T>
{
    private _Value: any;
    private _Bind: Bindable<T>[];      // to bind

    constructor()
    {
        this._Bind = new Array<Bindable<T>>();
    }

    get Text(): string
    {
        return this._Value;
    }
    set Text(value: string)
    {
        let svalue: string = (value === null || typeof value === "undefined") ? "" : value;
        if (this._Value !== svalue)
        {
            this._Value = svalue;
            this.Binding();
        }
    }

    get Value(): T
    {
        return this._Value;
    }
    set Value(value: T)
    {
        let svalue: T = (value === null || typeof value === "undefined") ? null : value;
        if (this._Value !== svalue)
        {
            this._Value = svalue;
            this.Binding();
        }
    }

    set Bind(value: Bindable<T>)
    {
        let tBindable: Bindable<T> = null;
        tBindable = Common.find(this._Bind, (ivalue: Bindable<T>, index: number, array: Bindable<T>[]): boolean =>
        {
            if (value === ivalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });

        if (tBindable === null || typeof tBindable === "undefined")
        {
            this._Bind.push(value);
        }
    }

    private Binding(): void
    {
        this._Bind.forEach((value: Bindable<T>, index: number, array: Bindable<T>[]) =>
        {
            if (value !== null && typeof value !== "undefined" && value.AutoRef === true)
            {
                value.set_Text(this._Value);
                value.set_Css(this._Value);
                value.set_TextCss(this._Value);
            }
        });
    }

    OnBind(value: Bindable<T>): void
    {
        if (value !== null && typeof value !== "undefined" && value.AutoRef === true)
        {
            value.set_Text(this._Value);
            value.set_Css(this._Value);
            value.set_TextCss(this._Value);
        }
    }
}


//
// HTML element
//
export interface Elem
{
    ToString(): string;
}

//
// Bindable Component
//
export abstract class Bindable<T>
{
    private _Parent: any;
    protected _JElem: JQuery;
    protected _Id: string;
    protected _Value: any;
    protected _CssClass: string[];
    protected _Attribute: { key: string; value: string }[];
    private _AutoRef: boolean;              // バインド先データが変更された場合に自動で反映するか、 == trueの場合は自動反映
    private _TwoWayRef: boolean;            // 値が変更された際に、バインド先データも自動で変更するか、== trueの場合は自動変更
    private _Origin: Object;                // コンポーネントと紐づけるオブジェクト
    static isClicked: boolean;              // シングルクリックとダブルクリックの判定用
    private _OnClick: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnDoubleClick: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnRightButtonClick: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnChange: ((target: Bindable<T>, origin: Object) => void)[];
    private _OnSpinChange: ((target: Bindable<T>, origin: Object) => void)[];

    private _BData: BData<T>;
    protected _BmText: (value: any) => void;
    protected _BmCss: (value: any) => void;
    protected _BmTextCss: (value: any) => void;

    constructor(id: string = null, parent: any = null, je: boolean = true, autoref: boolean = true, origin: Object = null)
    {
        this._OnClick = new Array<(target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnDoubleClick = new Array<(target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnRightButtonClick = new Array<(target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnChange = new Array<(target: Bindable<T>, origin: Object) => void>();
        this._OnSpinChange = new Array<(target: Bindable<T>, origin: Object) => void>();
        this._Id = id;
        this._Parent = parent;
        this._JElem = (je == true && id !== null) ? $(Com.ID(id)) : null;
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let OnClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0};
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnClick(this, mpos);
            };
            let OnDoubleClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnDoubleClick(this, mpos);
            };
            let OnRightButtonClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnRightButtonClick(this, mpos);
                return false;
            };
            let OnChangeFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                this.BindOnChange(this);
            };
            let OnSpinChangeFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                this.BindOnSpinChange(this);
            };

            this._JElem.on("click", OnClickFunc);
            this._JElem.on("dblclick", OnDoubleClickFunc);

            //this._JElem.on("click", (eventObject: JQuery.Event, ...args: any[]): any =>
            //{
            //    if (Bindable.isClicked === true)
            //    {
            //        // ダブルクリック
            //        OnDoubleClickFunc(eventObject, args);
            //        Bindable.isClicked = false;
            //        return;
            //    }

            //    // シングルクリックを受理、300ms間だけダブルクリック判定を残す
            //    Bindable.isClicked = true;
            //    setTimeout(function ()
            //    {
            //        // ダブルクリックによりclickedフラグがリセットされていない
            //        //     -> シングルクリックだった
            //        if (Bindable.isClicked === true)
            //        {
            //            OnClickFunc(eventObject, args);
            //        }
            //        this.isClicked = false;
            //    }, 300);
            //});

            this._JElem.on("change", OnChangeFunc);
            this._JElem.on("spinchange", OnSpinChangeFunc);

            // 右クリック
            this._JElem.on('contextmenu', OnRightButtonClickFunc);
        }

        this._AutoRef = autoref;
        this._TwoWayRef = false;
        this._Origin = origin;
        this._Value = null;
        this._CssClass = new Array<string>();
        this._Attribute = new Array<{ key: string; value: string }>();

        this._BData = null;
        this._BmText = null;
        this._BmCss = null;
        this._BmTextCss = null;
    }

    get JElem(): JQuery
    {
        return this._JElem;
    }

    get ID(): string
    {
        return this._Id;
    }
    set ID(value: string)
    {
        this._Id = value;
    }

    get Parent(): any
    {
        return this._Parent;
    }

    get AutoRef(): boolean
    {
        return this._AutoRef;
    }

    get TwoWayRef(): boolean
    {
        return this._TwoWayRef;
    }

    // バインド先のデータを設定する
    set_Bind(value: BData<T>, twoway: boolean = false)
    {
        this._BData = value;
        this._TwoWayRef = twoway;
        value.Bind = this;
        value.OnBind(this);
    }
    get_Bind(): BData<T>
    {
        return this._BData;
    }

    // 表示内容設定用
    // バインド先データが変更されていた場合は、データから呼ばれる
    set_Text(value: T): void
    {
    }
    // バインド先データの変更時に、データ内容から表示内容を生成するメソッドを予め設定する
    set BmText(func: (value: T) => void)
    {
        this._BmText = func;
    }
    // CSS設定用
    // バインド先データが変更されていた場合は、データから呼ばれる
    set_Css(value: T): void
    {
    }
    // バインド先データの変更時に、データ内容からCSSを生成するメソッドを予め設定する
    set BmCss(func: (value: T) => void)
    {
        this._BmCss = func;
    }
    // 表示内容とCSSの同時設定用
    // バインド先データが変更されていた場合は、データから呼ばれる
    set_TextCss(value: T): void
    {
    }
    // バインド先データの変更時に、データ内容からCSSを生成するメソッドを予め設定する
    set BmTextCss(func: (value: T) => void)
    {
        this._BmTextCss = func;
    }

    set OnClick(func: (target: Bindable<T>, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnClick, (fvalue: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            //let clickFunc = (target: Bindable<T>, mpos: { x: number; y: number }, origin: Object): void =>
            //{
            //    func(target, mpos, target._Origin);
            //};
            //this._OnClick.push(clickFunc);
            this._OnClick.push(func);
        }
    }
    private BindOnClick(elem: Bindable<T>, mpos: { x: number; y: number })
    {
        elem._OnClick.forEach((value: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnDoubleClick(func: (target: Bindable<T>, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnDoubleClick, (fvalue: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnDoubleClick.push(func);
        }
    }
    private BindOnDoubleClick(elem: Bindable<T>, mpos: { x: number; y: number })
    {
        elem._OnDoubleClick.forEach((value: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnRightButtonClick(func: (target: Bindable<T>, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnRightButtonClick, (fvalue: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnRightButtonClick.push(func);
        }
    }
    private BindOnRightButtonClick(elem: Bindable<T>, mpos: { x: number; y: number })
    {
        elem._OnRightButtonClick.forEach((value: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Bindable<T>, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnChange(func: (target: Bindable<T>, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnChange, (fvalue: ((target: Bindable<T>, origin: Object) => void), index: number, array: ((target: Bindable<T>, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            //let changeFunc = (target: Bindable<T>, origin: Object): void =>
            //{
            //    func(target, target._Origin);
            //};
            //this._OnChange.push(changeFunc);
            this._OnChange.push(func);
        }
    }
    private BindOnChange(elem: Bindable<T>)
    {
        if (elem._BData !== null && typeof elem._BData !== "undefined")
        {
            if (elem._TwoWayRef === true)
            {
                elem._BData.Value = elem.get_Value();
            }
        }

        elem._OnChange.forEach((value: ((target: Bindable<T>, origin: Object) => void), index: number, array: ((target: Bindable<T>, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, elem._Origin);
            }
        });
    }

    set OnSpinChange(func: (target: Bindable<T>, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnSpinChange, (fvalue: ((target: Bindable<T>, origin: Object) => void), index: number, array: ((target: Bindable<T>, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            //let changeFunc = (target: Bindable<T>, origin: Object): void =>
            //{
            //    func(target, target._Origin);
            //};
            //this._OnSpinChange.push(changeFunc);
            this._OnSpinChange.push(func);
        }
    }
    private BindOnSpinChange(elem: Bindable<T>)
    {
        if (elem._BData !== null && typeof elem._BData !== "undefined")
        {
            if (elem._TwoWayRef === true)
            {
                elem._BData.Value = this.get_Value();
            }
        }

        elem._OnSpinChange.forEach((value: ((target: Bindable<T>, origin: Object) => void), index: number, array: ((target: Bindable<T>, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, elem._Origin);
            }
        });
    }

    RefJQ(): void
    {
        this._JElem = (this._Id !== null) ? $(Com.ID(this._Id)) : null;
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let OnClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnClick(this, mpos);
            };
            let OnDoubleClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnDoubleClick(this, mpos);
            };
            let OnRightButtonClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnRightButtonClick(this, mpos);
                return false;
            };
            let OnChangeFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                this.BindOnChange(this);
            };
            let OnSpinChangeFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                this.BindOnSpinChange(this);
            };

            //this._JElem.on("click", (eventObject: JQuery.Event, ...args: any[]): any =>
            //{
            //    if (Bindable.isClicked === true)
            //    {
            //        // ダブルクリック
            //        OnDoubleClickFunc(eventObject, args);
            //        Bindable.isClicked = false;
            //        return;
            //    }

            //    // シングルクリックを受理、300ms間だけダブルクリック判定を残す
            //    Bindable.isClicked = true;
            //    setTimeout(function ()
            //    {
            //        // ダブルクリックによりclickedフラグがリセットされていない
            //        //     -> シングルクリックだった
            //        if (this.isClicked === true)
            //        {
            //            OnClickFunc(eventObject, args);
            //        }
            //        Bindable.isClicked = false;
            //    }, 300);
            //});

            this._JElem.on("click", OnClickFunc);
            this._JElem.on("dblclick", OnDoubleClickFunc);

            this._JElem.on("change", OnChangeFunc);
            this._JElem.on("spinchange", OnSpinChangeFunc);

            // 右クリック
            this._JElem.on('contextmenu', OnRightButtonClickFunc);
        }
    }

    SetHTML(html: string): void
    {
        this._JElem.html(html);
    }

    get_Value(): any
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.val();
        }
        else
        {
            return this._Value;
        }
    }
    set_Value(value: any): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(value);
        }
        else
        {
            this._Value = value;
        }
    }

    get Text(): string
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.text();
        }
        else
        {
            return this._Value;
        }
    }
    set Text(value: string)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.text(value);
        }
        else
        {
            this._Value = value;
        }
    }

    Append(value: string)
    {
        this._JElem.append(value);
    }

    get CssClass(): string
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let sclass: string = this._JElem.attr("class");
            return (sclass !== null && typeof sclass !== "undefined") ? sclass : "";
        }
        else
        {
            let strCss = (this._CssClass.length > 0) ? this._CssClass.join(" ") : "";
            return strCss;
        }
    }
    set CssClass(value: string)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.addClass(value);
        }

        let cssClass = Common.find(this._CssClass, (cvalue: string, index: number, array: string[]): boolean =>
        {
            if (value === cvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (cssClass === null || typeof cssClass === "undefined")
        {
            this._CssClass.push(value);
        }
    }
    remove_CssClass(value: string): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass(value);
        }

        this._CssClass.some((cvalue: string, index: number, array: string[]): boolean =>
        {
            if (value === cvalue)
            {
                this._CssClass.splice(index, 1);
                return true;
            }
            else
            {
                return false;
            }
        });
    }
    removeAll_CssClass(): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass();
        }

        this._CssClass.splice(0, this._CssClass.length);
    }

    set Attribute(attr: { key: string; value: string })
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.attr(attr.key, attr.value);
        }

        let target: { key: string; value: string } = null;
        target = Common.find(this._Attribute, (avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): boolean =>
        {
            if (avalue.key === attr.key)
            {
                return true;
            }
            else
            {
                return false;
            }
        });

        if (target !== null && typeof target !== "undefined")
        {
            target.value += " " + attr.value;
        }
        else
        {
            this._Attribute.push(attr);
        }
    }

    Show(): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass("closed");
        }
    }

    Hide(): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.addClass("closed");
        }
    }

    get Height(): number
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.height();
        }
        else
        {
            return 0;
        }
    }

    set Height(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            //this._JElem.height(value);
            this._JElem.css("height", value.toString() + "px");
        }
    }

    get Width(): number
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.width();
        }
        else
        {
            return 0;
        }
    }

    set Width(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            //this._JElem.height(value);
            this._JElem.css("width", value.toString() + "px");
        }
    }

    set MaxWidth(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.css("max-width", value.toString() + "px");
        }
    }

    set MinWidth(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.css("min-width", value.toString() + "px");
        }
    }
}


//
// ページのWindow
//
export class HTMLWindow
{
    private _OnResize: (() => void)[];
    private _OnWiderResize: (() => void)[];
    private _OnNarrowResize: (() => void)[];
    private _OnHigherResize: (() => void)[];
    private _OnLowResize: (() => void)[];
    private _OnUnload: (() => void)[];
    private timer: any = 0;
    private oldWindowSize: { width: number; height: number } = { width: 0, height: 0 };

    constructor()
    {
        this._OnResize = new Array<() => void>();
        this._OnWiderResize = new Array<() => void>();
        this._OnNarrowResize = new Array<() => void>();
        this._OnHigherResize = new Array<() => void>();
        this._OnLowResize = new Array<() => void>();

        this._OnUnload = new Array<() => void>();

        let OnResizeFunc = (): void =>
        {
            this.BindOnResize(this);

            let tmpOldWindowSize = this.oldWindowSize;
            let newWindowSize: { width: number; height: number } = HTMLWindow.get_Size();
            this.oldWindowSize = newWindowSize;
            if (newWindowSize.height > tmpOldWindowSize.height)
            {
                this.BindOnHigherResize(this);
            }
            if (newWindowSize.height < tmpOldWindowSize.height)
            {
                this.BindOnLowResize(this);
            }
            if (newWindowSize.width > tmpOldWindowSize.width)
            {
                this.BindOnWiderResize(this);
            }
            if (newWindowSize.width < tmpOldWindowSize.width)
            {
                this.BindOnNarrowResize(this);
            }
        };
        this.timer = 0;
        window.onresize = (): void =>
        {
            if (this.timer > 0)
            {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout((): void =>
            {
                OnResizeFunc();
            }, 500);
        };

        let OnUnloadFunc = (): any =>
        {
            this.BindOnUnload(this);
        };
        window.onbeforeunload = OnUnloadFunc;
    }

    set OnResize(func: () => void)
    {
        let ctarget = Common.find(this._OnResize, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnResize.push(func);
        }
    }
    private BindOnResize(elem: HTMLWindow)
    {
        elem._OnResize.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    set OnWiderResize(func: () => void)
    {
        let ctarget = Common.find(this._OnWiderResize, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnWiderResize.push(func);
        }
    }
    private BindOnWiderResize(elem: HTMLWindow)
    {
        elem._OnWiderResize.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    set OnNarrowResize(func: () => void)
    {
        let ctarget = Common.find(this._OnNarrowResize, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnNarrowResize.push(func);
        }
    }
    private BindOnNarrowResize(elem: HTMLWindow)
    {
        elem._OnNarrowResize.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    set OnHigherResize(func: () => void)
    {
        let ctarget = Common.find(this._OnHigherResize, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnHigherResize.push(func);
        }
    }
    private BindOnHigherResize(elem: HTMLWindow)
    {
        elem._OnHigherResize.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    set OnLowResize(func: () => void)
    {
        let ctarget = Common.find(this._OnLowResize, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnLowResize.push(func);
        }
    }
    private BindOnLowResize(elem: HTMLWindow)
    {
        elem._OnLowResize.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    set OnUnload(func: () => void)
    {
        let ctarget = Common.find(this._OnUnload, (fvalue: () => void, index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnUnload.push(func);
        }
    }
    private BindOnUnload(elem: HTMLWindow)
    {
        elem._OnUnload.forEach((value: () => void, index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }

    // スクリーン上の位置を取得
    public static get_Position(): { x: number; y: number }
    {
        let retVal: { x: number; y: number } = { x: 0, y: 0 };
        retVal.x = window.screenX;
        retVal.y = window.screenY;
        return retVal;
    }
    // スクリーン上の指定位置に移動
    public static set_Position(value: { x: number; y: number }): void
    {
        window.moveTo(value.x, value.y);
    }

    // ウィンドウのサイズを取得
    public static get_Size(): { width: number; height: number }
    {
        let retVal: { width: number; height: number } = { width: 0, height: 0 };
        retVal.width = window.outerWidth;
        retVal.height = window.outerHeight;
        return retVal;
    }
    // ウィンドウのサイズを変更
    public static set_Size(value: { width: number; height: number }): void
    {
        window.resizeTo(value.width, value.height);
    }

    // ウィンドウ内のサイズを取得
    public static get_InnerSize(): { width: number; height: number }
    {
        let retVal: { width: number; height: number } = { width: 0, height: 0 };
        retVal.width = window.innerWidth;
        retVal.height = window.innerHeight;
        return retVal;
    }
}

//
// ページのBody
//
export class HTMLBody
{
    private _JElem: JQuery;
    private _S4Workspace: JQuery;
    private _CssClass: string[];
    private _Attribute: { key: string; value: string }[];
    private _OnClick: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[];
    private _OnRightButtonClick: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[];

    constructor()
    {
        this._OnClick = new Array<(target: HTMLBody, mpos: { x: number; y: number }) => void>();
        this._OnRightButtonClick = new Array<(target: HTMLBody, mpos: { x: number; y: number }) => void>();
        this._JElem = $("body");
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let OnClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnClick(this, mpos);
            };
            let OnRightButtonClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnRightButtonClick(this, mpos);
                return false;
            };

            this._JElem.on("click", OnClickFunc);

            // 右クリック
            this._JElem.on('contextmenu', OnRightButtonClickFunc);
        }

        this._S4Workspace = $(Com.ID("s4-workspace"));

        this._CssClass = new Array<string>();
        this._Attribute = new Array<{ key: string; value: string }>();
    }

    get JElem(): JQuery
    {
        return this._JElem;
    }

    get CssClass(): string
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let sclass: string = this._JElem.attr("class");
            return (sclass !== null && typeof sclass !== "undefined") ? sclass : "";
        }
        else
        {
            let strCss = (this._CssClass.length > 0) ? this._CssClass.join(" ") : null;
            return strCss;
        }
    }
    set CssClass(value: string)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.addClass(value);
        }

        let cssClass = Common.find(this._CssClass, (cvalue: string, index: number, array: string[]): boolean =>
        {
            if (value === cvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (cssClass === null || typeof cssClass === "undefined")
        {
            this._CssClass.push(value);
        }
    }
    remove_CssClass(value: string): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass(value);
        }

        this._CssClass.some((cvalue: string, index: number, array: string[]): boolean =>
        {
            if (value === cvalue)
            {
                this._CssClass.splice(index, 1);
                return true;
            }
            else
            {
                return false;
            }
        });
    }
    removeAll_CssClass(): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass();
        }

        this._CssClass.splice(0, this._CssClass.length);
    }

    set Attribute(attr: { key: string; value: string })
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.attr(attr.key, attr.value);
        }

        let target: { key: string; value: string } = null;
        target = Common.find(this._Attribute, (avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): boolean =>
        {
            if (avalue.key === attr.key)
            {
                return true;
            }
            else
            {
                return false;
            }
        });

        if (target !== null && typeof target !== "undefined")
        {
            target.value += " " + attr.value;
        }
        else
        {
            this._Attribute.push(attr);
        }
    }

    get Height(): number
    {
        let height: number = window.innerHeight;

        if (height !== null && typeof height !== "undefined")
        {
            return height;
        }
        else
        {
            return 0;
        }
    }

    set Height(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.height(value);
        }
    }

    get Width(): number
    {
        let width: number = window.innerWidth;

        if (width !== null && typeof width !== "undefined")
        {
            return width;
        }
        else
        {
            return 0;
        }
    }

    set S4Workspace_Width(value: number)
    {
        if (this._S4Workspace !== null && typeof this._S4Workspace !== "undefined" && this._S4Workspace.length > 0)
        {
            this._S4Workspace.width(value);
        }
    }

    set S4Workspace_Height(value: number)
    {
        if (this._S4Workspace !== null && typeof this._S4Workspace !== "undefined" && this._S4Workspace.length > 0)
        {
            this._S4Workspace.height(value);
        }
    }

    set OnClick(func: (target: HTMLBody, pos: { x: number; y: number }) => void)
    {
        let ctarget = Common.find(this._OnClick, (fvalue: ((target: HTMLBody, mpos: { x: number; y: number }) => void), index: number, array: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnClick.push(func);
        }
    }
    private BindOnClick(elem: HTMLBody, mpos: { x: number; y: number })
    {
        elem._OnClick.forEach((value: ((target: HTMLBody, mpos: { x: number; y: number }) => void), index: number, array: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    set OnRightButtonClick(func: (target: HTMLBody, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnRightButtonClick, (fvalue: ((target: HTMLBody, mpos: { x: number; y: number }) => void), index: number, array: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            this._OnRightButtonClick.push(func);
        }
    }
    private BindOnRightButtonClick(elem: HTMLBody, mpos: { x: number; y: number })
    {
        elem._OnRightButtonClick.forEach((value: ((target: HTMLBody, mpos: { x: number; y: number }) => void), index: number, array: ((target: HTMLBody, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }
}

//
// Label
//
export class Label extends Bindable<any> implements Elem
{
    private _Type: string;

    constructor(id: string = null, parent: any = null, je: boolean = true, type: string = "div")
    {
        super(id, parent, je);
        this._Type = type;
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<" + this._Type + " id='" + this._Id + "' " + strCss + strAttribute + ">" + Common.HtmlEscape(this.Text) + "</" + this._Type + ">";
        }
        else
        {
            strOut = "<" + this._Type + " " + strCss + strAttribute + ">" + Common.HtmlEscape(this.Text) + "</" + this._Type + ">";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: any): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.Text = value;
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: any): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: any): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// ボタン
//
export class Button
{
    private _Button: JQuery;
    private _Id: string;

    constructor(id: string)
    {
        this._Id = id;
        this._Button = $(Com.ID(id));
    }

    get ID(): string
    {
        return this._Id;
    }

    get Text(): string
    {
        return <string>this._Button.val();
    }
    set Text(value: string)
    {
        this._Button.val(value);
    }

    set OnClick(func: () => void)
    {
        this._Button.on("click", func);
    }

    Show(): void
    {
        if (this._Button !== null && typeof this._Button !== "undefined" && this._Button.length > 0)
        {
            this._Button.removeClass("closed");
        }
    }

    Hide(): void
    {
        if (this._Button !== null && typeof this._Button !== "undefined" && this._Button.length > 0)
        {
            this._Button.addClass("closed");
        }
    }
}

//
// テキストボックス
//
export class TextBox extends Bindable<any> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    get Text(): any
    {
        return super.get_Value();
    }
    set Text(value: any)
    {
        super.set_Value(value);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='text' id='" + this._Id + "' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        else
        {
            strOut = "<input type='text' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: any): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.Text = value;
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: any): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: any): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// Textarea
//
export class TextArea extends Bindable<string> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    //set OnTextChange(func: (target: TextBox) => void)
    //{
    //    let changeFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
    //    {
    //        func(this);
    //    };

    //    super.OnChange = changeFunc;
    //}

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<textarea id='" + this._Id + "' " + strCss + strAttribute + ">" + this.Text + "</textarea>";
        }
        else
        {
            strOut = "<textarea " + strCss + strAttribute + ">" + this.Text + "</textarea>";
        }
        return strOut;
    }

    get Text(): string
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return <string>this._JElem.val();
        }
        else
        {
            return this._Value;
        }
    }
    set Text(value: string)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(value);
        }
        else
        {
            this._Value = value;
        }
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: string): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.Text = value;
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: string): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: string): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// チェックボックス
//
export class CheckBox extends Bindable<boolean> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    get_Value(): boolean
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.prop('checked') ? true : false;
        }
        else
        {
            return this._Value;
        }
    }
    set_Value(value: boolean): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            if (value === true)
            {
                this._JElem.prop('checked', true);
            }
            else
            {
                this._JElem.prop('checked', false);
            }
        }
        else
        {
            this._Value = value;
        }
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });
        let strChecked = (this.get_Value() === true) ? "checked='checked' " : "";

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='checkbox' id='" + this._Id + "' " + strChecked + strCss + strAttribute + "></input>";
        }
        else
        {
            strOut = "<input type='checkbox' " + strChecked + strCss + strAttribute + "></input>";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: boolean): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.set_Value(value);
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: boolean): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: boolean): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// ドロップダウンリスト
//
export class DropDownList extends Bindable<number> implements Elem
{
    private _Items: { value: string; title: string }[];

    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
        this._Items = new Array<{ value: string; title: string }>();
    }

    add_Item(item: { value: string; title: string })
    {
        let eitems: { value: string; title: string } = Common.find(this._Items, (fitem: { value: string; title: string }, index: number, array: { value: string; title: string }[]): boolean =>
        {
            if (fitem.value === item.value)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (eitems === null || typeof eitems === "undefined")
        {

            if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
            {
                let jitem: JQuery = $("<option>", { value: item.value, text: item.title, selected: false });
                this._JElem.append(jitem);
            }
            this._Items.push(item);
        }
    }

    get_Value(): number
    {
        if (super.get_Value() === null)
        {
            return 0;
        }
        let vvalue: number = parseInt(super.get_Value());
        if (vvalue === null || typeof vvalue === "undefined")
        {
            return 0;
        }
        return vvalue;
    }
    set_Value(value: number): void
    {
        let svalue: string = (value === null || typeof value === "undefined") ? "" : value.toString();

        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(svalue);
        }
        else
        {
            this._Value = value;
        }
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });
        let strOption = "";
        this._Items.forEach((item: { value: string; title: string }, index: number, array: { value: string; title: string }[]): void =>
        {
            strOption += "<option value='" + item.value + "'>" + item.title + "</option>";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<select id='" + this._Id + "' " + strCss + strAttribute + ">" + strOption + "</select>";
        }
        else
        {
            strOut = "<select " + strCss + strAttribute + ">" + strOption + "</select>";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: number): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.set_Value(value);
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: number): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: number): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// ラジオボタンリスト
//
export class RadioButtonList extends Bindable<number> implements Elem
{
    private _Items: { value: string; title: string }[];

    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
        this._Items = new Array<{ value: string; title: string }>();
    }

    add_Item(item: { value: string; title: string })
    {
        let eitems: { value: string; title: string } = Common.find(this._Items, (fitem: { value: string; title: string }, index: number, array: { value: string; title: string }[]): boolean =>
        {
            if (fitem.value === item.value)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (eitems === null || typeof eitems === "undefined")
        {

            if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
            {
                let jitem: JQuery = $("<option>", { value: item.value, text: item.title, selected: false });
                this._JElem.append(jitem);
            }
            this._Items.push(item);
        }
    }

    get_Value(): number
    {
        if (super.get_Value() === null)
        {
            return 0;
        }
        let vvalue: number = parseInt(super.get_Value());
        if (vvalue === null || typeof vvalue === "undefined")
        {
            return 0;
        }
        return vvalue;
    }
    set_Value(value: number): void
    {
        let svalue: string = (value === null || typeof value === "undefined") ? "" : value.toString();

        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(svalue);
        }
        else
        {
            this._Value = value;
        }
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            this._Items.forEach((item: { value: string; title: string }, index: number, array: { value: string; title: string }[]): void =>
            {
                strOut = "<input type='radio' id='" + this._Id + "' name='" + this._Id + "' value='" + item.value + "' " + strCss + strAttribute + ">" + item.title + "</input>";
            });
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: number): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.set_Value(value);
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: number): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: number): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// DatePicker
//  _Valueは、Date型で保持し、ValueはDate型とする
//  JQueryによるレンダリングは、stringとする
//
export class DatePicker extends Bindable<Date> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.datepicker();
        }
    }

    RefJQ(): void
    {
        super.RefJQ();
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.datepicker();
        }
    }

    get_Value(): Date
    {
        if (super.get_Value() === null)
        {
            return null;
        }
        let vdate: Date = new Date(super.get_Value());
        if (vdate === null || typeof vdate === "undefined" || isNaN(vdate.getTime()) === true)
        {
            return null;
        }
        return vdate;
    }
    set_Value(value: Date): void
    {
        value = (value === null || typeof value === "undefined") ? null : value;
        let fdate: string = "";
        if (value === null || typeof value === "undefined")
        {
            fdate = "";
        }
        else
        {
            fdate = Common.get_DateString(value);
        }

        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(fdate);
        }
        else
        {
            this._Value = value;
        }
    }

    get Text(): string
    {
        if (super.get_Value() === null)
        {
            return "";
        }
        let vdate: Date = new Date(super.get_Value());
        if (vdate === null || typeof vdate === "undefined")
        {
            return "";
        }
        return Common.get_DateString(vdate);
    }
    set Text(value: string)
    {
        let vdate: Date = null;
        vdate = (value === null || typeof value === "undefined") ? null : new Date(value);
        vdate = (vdate === null || typeof vdate === "undefined") ? null : vdate;
        this.set_Value(vdate);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='text' id='" + this._Id + "' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        else
        {
            strOut = "<input type='text' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: Date): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.set_Value(value);
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: Date): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: Date): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// Spinner
//  _Valueは、number型で保持し、Valueはnumber型とする
//  JQueryによるレンダリングは、stringとする
//
export class Spinner extends Bindable<number> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.spinner({ min: 0 });
        }
    }

    RefJQ(): void
    {
        super.RefJQ();
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.spinner({ min: 0 });
        }
    }

    get_Value(): number
    {
        if (super.get_Value() === null)
        {
            return 0;
        }
        let vvalue: number = parseInt(super.get_Value());
        if (vvalue === null || typeof vvalue === "undefined")
        {
            return 0;
        }
        return vvalue;
    }
    set_Value(value: number): void
    {
        let svalue: string = (value === null || typeof value === "undefined") ? "" : value.toString();

        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._Value = value;
            this._JElem.val(svalue);
        }
        else
        {
            this._Value = value;
        }
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='text' id='" + this._Id + "' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        else
        {
            strOut = "<input type='text' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        return strOut;
    }

    // 表示内容設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Text(value: number): void
    {
        if (this._BmTextCss === null)
        {
            if (this._BmText !== null)
            {
                this._BmText(value);
            }
            else
            {
                this.set_Value(value);
            }
        }
    }
    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: number): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
    // 表示内容とCSSの同時設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_TextCss(value: number): void
    {
        if (this._BmTextCss !== null)
        {
            this._BmTextCss(value);
        }
    }
}

//
// ファイルアップロード
//
export class FileUpload extends Bindable<any> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    get File(): File
    {
        let inputElement: HTMLInputElement = <HTMLInputElement>this._JElem[0];
        let inputFile: File = inputElement.files[0];
        return inputFile;
    }

    get FileName(): string
    {
        let aryFilePath: string[] = (<string>super.get_Value()).split(/\\/);
        if (aryFilePath.length > 0)
        {
            let fileName: string = aryFilePath[aryFilePath.length - 1];
            return (fileName === null || typeof fileName === "undefined") ? "" : fileName;
        }
        else
        {
            return "";
        }
    }

    ReadAsText(): Promise<string>
    {
        return Common.ReadAsText(this.File);
    }

    ReadAsBinary(): Promise<any>
    {
        return Common.ReadAsBinary(this.File);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='file' id='" + this._Id + "' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        else
        {
            strOut = "<input type='file' " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        return strOut;
    }
}

//
// 複数ファイルアップロード
//
export class MultiFilesUpload extends Bindable<any> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    get Files(): File[]
    {
        let retFiles: File[] = new Array<File>();
        let inputElement: HTMLInputElement = <HTMLInputElement>this._JElem[0];
        let inputFiles: FileList = inputElement.files;
        for (let i = 0; i < inputFiles.length; i++)
        {
            let file: File = inputFiles[i];
            retFiles.push(file);
        }
        return retFiles;
    }

    get_FileName(file: File): string
    {
        return Common.get_FileName(file);
    }

    ReadAsText(file: File): Promise<string>
    {
        return Common.ReadAsText(file);
    }

    ReadAsBinary(file: File): Promise<any>
    {
        return Common.ReadAsBinary(file);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<input type='file' id='" + this._Id + "' multiple " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        else
        {
            strOut = "<input type='file' multiple " + strCss + strAttribute + " value='" + this.Text + "'></input>";
        }
        return strOut;
    }
}

//
// ファイルドロップダウンエリア
//
export class MultiFilesDropArea extends Bindable<any> implements Elem
{
    private _Files: File[];
    private _OnDrop: ((dropFiles: File[], mpos: { x: number; y: number }) => void)[];
    private _OnDragEnter: ((mpos: { x: number; y: number }) => void)[];
    private _OnDragLeave: ((mpos: { x: number; y: number }) => void)[];
    private top: number;
    private left: number;
    private height: number;
    private width: number;
    private isEnter: boolean;
    private _area: JQuery;

    constructor(id: string = null, parent: any = null, je: boolean = true, backareaId: string)
    {
        super(id, parent, je);
        this._Files = new Array<File>();
        this._OnDrop = new Array<(dropFiles: File[], mpos: { x: number; y: number }) => void>();
        this._OnDragEnter = new Array<(mpos: { x: number; y: number }) => void>();
        this._OnDragLeave = new Array<(mpos: { x: number; y: number }) => void>();
        if (backareaId !== null && typeof backareaId !== "undefined" && backareaId.length > 0)
        {
            this._area = $(Com.ID(backareaId));
        }
        else
        {
            this._area = $("body");
        }

        let OnDragEnterFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            eventObject.stopPropagation();
            eventObject.originalEvent.dataTransfer.dropEffect = "copy";

            this.isEnter = true;
            let dpos: JQueryCoordinates = this._JElem.offset();
            this.left = dpos.left;
            this.top = dpos.top;
            this.width = this._JElem.outerWidth();
            this.height = this._JElem.outerHeight();

            let OnMouseActionFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                if (this.isEnter === true)
                {
                    let mpos: { x: number; y: number } = { x: 0, y: 0 };
                    mpos.x = eventObject.clientX;
                    mpos.y = eventObject.clientY;

                    if (mpos.x < this.left || (this.left + this.width) < mpos.x || mpos.y < this.top || mpos.y > (this.top + this.height))
                    {
                        this.BindOnDragLeave(mpos);
                    }
                }
            };
            this._area.on("click", OnMouseActionFunc);
            this._area.on("mouseover", OnMouseActionFunc);
            this._area.on("mouseout", OnMouseActionFunc);

            let mpos: { x: number; y: number } = { x: 0, y: 0 };
            mpos.x = eventObject.clientX;
            mpos.y = eventObject.clientY;
            this.BindOnDragEnter(mpos);
        };

        let OnDragLeaveFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            let mpos: { x: number; y: number } = { x: 0, y: 0 };
            mpos.x = eventObject.clientX;
            mpos.y = eventObject.clientY;

            if (mpos.x < this.left || (this.left + this.width) < mpos.x || mpos.y < this.top || mpos.y > (this.top + this.height))
            {
                this.isEnter = false;

                this.BindOnDragLeave(mpos);
            }
        };

        let OnDragEndFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            let mpos: { x: number; y: number } = { x: 0, y: 0 };
            mpos.x = eventObject.clientX;
            mpos.y = eventObject.clientY;

            if (mpos.x < this.left || (this.left + this.width) < mpos.x || mpos.y < this.top || mpos.y > (this.top + this.height))
            {
                this.BindOnDragLeave(mpos);
            }
        };

        let OnDragOverFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            eventObject.preventDefault();
            let mpos: { x: number; y: number } = { x: 0, y: 0 };
            mpos.x = eventObject.clientX;
            mpos.y = eventObject.clientY;

            if (mpos.x < this.left || (this.left + this.width) < mpos.x || mpos.y < this.top || mpos.y > (this.top + this.height))
            {
                this.BindOnDragLeave(mpos);
            }
        };

        let OnDropFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            eventObject.stopPropagation();
            eventObject.preventDefault();

            this.isEnter = false;

            this._Files = new Array<File>();
            let inputFiles: FileList = eventObject.originalEvent.dataTransfer.files;
            for (let i = 0; i < inputFiles.length; i++)
            {
                let file: File = inputFiles[i];
                this._Files.push(file);
            }

            let mpos: { x: number; y: number } = { x: 0, y: 0 };
            mpos.x = eventObject.clientX;
            mpos.y = eventObject.clientY;
            this.BindOnDrop(mpos);
        };

        this._JElem.on("dragover", OnDragOverFunc);
        this._JElem.on("dragenter", OnDragEnterFunc);
        this._JElem.on("dragleave", OnDragLeaveFunc);
        this._JElem.on("draglend", OnDragEndFunc);
        this._JElem.on("drop", OnDropFunc);
    }

    get Files(): File[]
    {
        return this._Files;
    }

    get_FileName(file: File): string
    {
        return Common.get_FileName(file);
    }

    ReadAsText(file: File): Promise<string>
    {
        return Common.ReadAsText(file);
    }

    ReadAsBinary(file: File): Promise<any>
    {
        return Common.ReadAsBinary(file);
    }

    // Dropイベントを削除する
    remove_OnDrop(): void
    {
        this._OnDrop = new Array<(dropFiles: File[], mpos: { x: number; y: number }) => void>();
    }

    // Dropイベントを登録する
    set OnDrop(func: (dropFiles: File[], pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnDrop, (fvalue: ((dropFiles: File[], mpos: { x: number; y: number }) => void), index: number, array: ((dropFiles: File[], mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let dropFunc = (dropFiles: File[], mpos: { x: number; y: number }): void =>
            {
                func(dropFiles, mpos);
            };
            this._OnDrop.push(dropFunc);
        }
    }
    private BindOnDrop(mpos: { x: number; y: number })
    {
        this._OnDrop.forEach((value: ((dropFiles: File[], mpos: { x: number; y: number }) => void), index: number, array: ((dropFiles: File[], mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(this.Files, mpos);
            }
        });
    }

    // Drag Enterイベントを削除する
    remove_OnDragEnter(): void
    {
        this._OnDragEnter = new Array<(mpos: { x: number; y: number }) => void>();
    }

    // Drag Enterイベントを登録する
    set OnDragEnter(func: (pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnDragEnter, (fvalue: ((mpos: { x: number; y: number }) => void), index: number, array: ((mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let dragoverFunc = (mpos: { x: number; y: number }): void =>
            {
                func(mpos);
            };
            this._OnDragEnter.push(dragoverFunc);
        }
    }
    private BindOnDragEnter(mpos: { x: number; y: number })
    {
        this._OnDragEnter.forEach((value: ((mpos: { x: number; y: number }) => void), index: number, array: ((mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(mpos);
            }
        });
    }

    // Drag Leaveイベントを削除する
    remove_OnDragLeave(): void
    {
        this._OnDragLeave = new Array<(mpos: { x: number; y: number }) => void>();
    }

    // Drag Leaveイベントを登録する
    set OnDragLeave(func: (pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnDragLeave, (fvalue: ((mpos: { x: number; y: number }) => void), index: number, array: ((mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let dragoverFunc = (mpos: { x: number; y: number }): void =>
            {
                func(mpos);
            };
            this._OnDragLeave.push(dragoverFunc);
        }
    }
    private BindOnDragLeave(mpos: { x: number; y: number })
    {
        this._OnDragLeave.forEach((value: ((mpos: { x: number; y: number }) => void), index: number, array: ((mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(mpos);
            }
        });
    }

    get CssClass(): string
    {
        return this._JElem.attr("class");
    }
    set CssClass(value: string)
    {
        this._JElem.addClass(value);
    }
    RemoveCssClass(value: string): void
    {
        this._JElem.removeClass(value);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<div id='" + this._Id + "' " + strCss + strAttribute + "></div>";
        }
        else
        {
            strOut = "<div " + strCss + strAttribute + "></div>";
        }
        return strOut;
    }
}


//
// 画像エリア
//
export class ImageArea extends Bindable<any> implements Elem
{
    constructor(id: string = null, parent: any = null, je: boolean = true)
    {
        super(id, parent, je);
    }

    Draw(url: string, alt: string = "", title: string = ""): void
    {
        this.Attribute = { key: "src", value: url };
        this.Attribute = { key: "alt", value: alt };
        this.Attribute = { key: "title", value: title };
        let image: string = this.ToString();
        this.Append(image);
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<img id='" + this._Id + "' " + strCss + strAttribute + " />";
        }
        else
        {
            strOut = "<img " + strCss + strAttribute + " />";
        }
        return strOut;
    }

    // CSS設定用
    // バインド先のデータが変更されていた場合は、データから呼ばれる
    set_Css(value: string): void
    {
        if (this._BmCss !== null)
        {
            this._BmCss(value);
        }
    }
}

//
// ダイアログボックス
//
export class Dialog
{
    protected _Dialog: JQuery;
    protected _Id: string;
    private _OnBlur: (() => void)[];
    private OpenTime: Date;
    private top: number;
    private left: number;
    private height: number;
    private width: number;
    private _area: JQuery;

    constructor(id: string, backareaId: string)
    {
        this._OnBlur = new Array<() => void>();
        this._Id = id;
        this.OpenTime = null;
        this._Dialog = (id !== null) ? $(Com.ID(id)) : null;
        if (backareaId !== null && typeof backareaId !== "undefined" && backareaId.length > 0)
        {
            this._area = $(Com.ID(backareaId));
        }
        else
        {
            this._area = $("body");
        }
    }

    get ID(): string
    {
        return this._Id;
    }

    Open(pos: { x: number; y: number }): void
    {
        this._Dialog.css({ 'left': pos.x.toString() + "px", 'top': pos.y.toString() + "px" });
        this._Dialog.removeClass("closed");
        this.OpenTime = new Date();

        let dpos: JQueryCoordinates = this._Dialog.offset();
        this.left = dpos.left;
        this.top = dpos.top;
        this.width = this._Dialog.outerWidth();
        this.height = this._Dialog.outerHeight();

        let OnBlurFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            if (this.OpenTime === null)
            {
                return;
            }
            let x: number = eventObject.clientX;
            let y: number = eventObject.clientY;
            let nowDateTime = new Date();
            let deltaMillsecond: number = nowDateTime.getTime() - this.OpenTime.getTime();
            if ((deltaMillsecond > 1000)
                &&
                (x < this.left || (this.left + this.width) < x || y < this.top || y > (this.top + this.height)))
            {
                this.BindOnBlur();
            }
        }
        this._area.on("click", OnBlurFunc);
    }

    Close(): void
    {
        this._area.off("click");
        this._Dialog.addClass("closed");
        this.OpenTime = null;
    }

    RefJQ(): void
    {
        this._Dialog = (this._Id !== null) ? $(Com.ID(this._Id)) : null;
    }

    set OnBlur(func: () => void)
    {
        let target = Common.find(this._OnBlur, (fvalue: (() => void), index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            this._OnBlur.push(func);
        }
    }
    private BindOnBlur(): void
    {
        this._OnBlur.forEach((value: (() => void), index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }
}

//
// JQuery UI ダイアログボックス
//
export class UIDialogBox
{
    protected _Dialog: JQuery;
    protected _Id: string;
    protected _Title: string;
    protected _TitleCss: string;
    private IsOpen: boolean;
    private _OnClose:(() => void)[];

    constructor(id: string, title: string = "", titleCss: string = null)
    {
        this._OnClose = new Array<() => void>();
        this._Id = id;
        this._Title = title;
        this._Dialog = (id !== null) ? $(Com.ID(id)) : null;
        this.IsOpen = false;
        this._TitleCss = titleCss;
    }

    get ID(): string
    {
        return this._Id;
    }

    get Title(): string
    {
        return this._Title;
    }
    set Title(value: string)
    {
        this._Title = value;
    }

    get TitleCss(): string
    {
        return this._TitleCss;
    }
    set TitleCss(value: string)
    {
        this._TitleCss = value;
    }

    Open(pos: { x: number; y: number }, iwidth: string = "30rem", titleCss: string = null, removeTitleCss: string = null, enableTitleCss: boolean = true): void
    {
        this._Dialog.removeClass("closed");
        this._Dialog.dialog(
            {
                title: this._Title,
                modal: true,
                width: iwidth
            });
        this.IsOpen = true;
        if (pos !== null && typeof pos != "undefined")
        {
            this._Dialog.css({ 'left': pos.x.toString() + "px", 'top': pos.y.toString() + "px" });
        }

        if (titleCss !== null && typeof titleCss != "undefined" && titleCss.length > 0)
        {
            let DivCore: Div = new Div(this._Id, true);
            let titleDiv: JQuery = DivCore.JElem.parent().find(".ui-dialog-titlebar");
            if (enableTitleCss === true)
            {
                titleDiv.addClass(titleCss);
                if (removeTitleCss !== null && typeof removeTitleCss != "undefined" && removeTitleCss.length > 0)
                {
                    titleDiv.removeClass(removeTitleCss);
                }
            }
            else
            {
                titleDiv.removeClass(titleCss);
                if (removeTitleCss !== null && typeof removeTitleCss != "undefined" && removeTitleCss.length > 0)
                {
                    titleDiv.removeClass(removeTitleCss);
                }
            }
        }
        else if (this._TitleCss !== null && typeof this._TitleCss != "undefined" && this._TitleCss.length > 0)
        {
            let DivCore: Div = new Div(this._Id, true);
            let titleDiv: JQuery = DivCore.JElem.parent().find(".ui-dialog-titlebar");
            if (enableTitleCss === true)
            {
                titleDiv.addClass(this._TitleCss);
            }
            else
            {
                titleDiv.removeClass(this._TitleCss);
            }
        }

        let OnCloseFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
        {
            if (this.IsOpen === false)
            {
                return;
            }
            this.IsOpen = false;
            this.BindOnClose();
        }
        this._Dialog.on("dialogclose", OnCloseFunc);
    }

    Close(): void
    {
        if (this.IsOpen === true)
        {
            this._Dialog.dialog("close");
            this.IsOpen = false;
        }
        this._Dialog.addClass("closed");
    }

    //
    // 「閉じる」イベントを登録する
    //
    set OnClose(func: () => void)
    {
        let target = Common.find(this._OnClose, (fvalue: (() => void), index: number, array: (() => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            this._OnClose.push(func);
        }
    }
    private BindOnClose(): void
    {
        this._OnClose.forEach((value: (() => void), index: number, array: (() => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value();
            }
        });
    }
}

//
// JQuery UI タブコントロール
//
export class UITab
{
    private _Tab: JQuery;
    private _Id: string;
    private IsOpen: boolean;

    constructor(id: string)
    {
        this._Id = id;
        this._Tab = (id !== null) ? $(Com.ID(id)) : null;
        this.IsOpen = false;
    }

    get ID(): string
    {
        return this._Id;
    }

    Open(): void
    {
        this._Tab.tabs();
        this.Active(0);
        this._Tab.removeClass("closed");
        this.IsOpen = true;
    }

    Active(tabnum: number): void
    {
        this._Tab.tabs("option", "active", tabnum);
    }

    Close(): void
    {
        if (this.IsOpen === true)
        {
            this.IsOpen = false;
        }
        this._Tab.addClass("closed");
    }
}

//
// メニュー
//
export class Menu extends Dialog
{
    private _Menu: JQuery;
    private _Ul: Ul;
    private _Div: Label[];

    constructor(id: string, backareaID: string)
    {
        super(id, backareaID);
        this._Ul = new Ul(id + "_Content");
        this._Div = new Array<Label>();
    }

    get ID(): string
    {
        return this._Id;
    }

    add_Menu(item: { title: string; func: (target: any, pos: { x: number; y: number }) => void })
    {
        let divLabel: Label = new Label(this._Id + "_Item" + (this._Div.length + 1).toString(), this, false);
        divLabel.Text = item.title;
        divLabel.OnClick = item.func;
        this._Div.push(divLabel);

        let liLabel: Li = new Li();
        liLabel.set_Content(divLabel);
        this._Ul.set_Content(liLabel);
    }

    clear_Menu()
    {
        this._Ul.clear_Content();
    }

    Open(pos: { x: number; y: number }): void
    {
        if (this._Dialog === null || typeof this._Dialog === "undefined")
        {
            this._Dialog = $(Com.ID(this._Id));
        }
        this._Dialog.html(this._Ul.ToString());
        this.RefJQ();
        this._Menu.menu();

        super.Open(pos);
    }

    RefJQ(): void
    {
        super.RefJQ();

        this._Menu = (this._Id !== null) ? $(Com.ID(this._Id + "_Content")) : null;
        if (this._Menu !== null && typeof this._Menu !== "undefined")
        {
            this._Div.forEach((value: Label, index: number, array: Label[]): void =>
            {
                value.RefJQ();
            });
        }
    }
}

//
// パンくずリスト
//
export class Breadcrumb implements Elem
{
    protected _Id: string;
    private _Breadcrumb: JQuery;
    private _Div: Div;
    private Crumb: Label[];
    private _Sp: Span;

    constructor(id: string, sp: string)
    {
        this._Id = id;
        this._Div = new Div(id + "_Content");
        this.Crumb = new Array<Label>();
        this._Sp = new Span();
        this._Sp.Text = sp;
        this._Breadcrumb = (id !== null) ? $(Com.ID(id)) : null;
    }

    get ID(): string
    {
        return this._Id;
    }

    add_TopCrumb(item: { title: string; func: (target: any, pos: { x: number; y: number }, origin: Object) => void })
    {
        let divLabel: Label = new Label(this._Id + "_Item" + (this.Crumb.length + 1).toString(), this, false, "span");
        divLabel.Text = item.title;
        divLabel.OnClick = item.func;
        this.Crumb.push(divLabel);
        this._Div.set_Content(divLabel);
    }

    add_NextCrumb(item: { title: string; func: (target: any, pos: { x: number; y: number }, origin: Object) => void })
    {
        let divLabel: Label = new Label(this._Id + "_Item" + (this.Crumb.length + 1).toString(), this, false, "span");
        divLabel.Text = item.title;
        divLabel.OnClick = item.func;
        this.Crumb.push(divLabel);
        this._Div.set_Content(this._Sp);
        this._Div.set_Content(divLabel);
    }

    remove_AllCrumb()
    {
        this.Crumb.splice(0, this.Crumb.length);
        this._Div.clear_Content();
    }

    ToString(): string
    {
        return this._Div.ToString();
    }

    Open(): void
    {
        if (this._Breadcrumb === null || typeof this._Breadcrumb === "undefined")
        {
            this._Breadcrumb = $(Com.ID(this._Id));
        }
        this._Breadcrumb.html(this.ToString());
        this.RefJQ();
    }

    RefJQ(): void
    {
        if (this._Breadcrumb !== null && typeof this._Breadcrumb !== "undefined")
        {
            this.Crumb.forEach((value: Label, index: number, array: Label[]): void =>
            {
                value.RefJQ();
            });
        }
    }
}

//
// GridView
//
export class GridView
{
    private _GridView: JQuery;
    private _Head: JQuery;
    private _Body: JQuery;
    private _Foot: JQuery;
    private _Id: string;
    private _OnFootClick: ((target: any, mpos: { x: number; y: number }) => void)[];
    private _OnHeadRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];
    private _OnBodyRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];
    private _OnFootRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];

    constructor(id: string)
    {
        this._OnFootClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
        this._OnHeadRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
        this._OnBodyRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
        this._OnFootRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();

        this._Id = id;
        this._GridView = $(Com.ID(id));
        this._Head = this._GridView.children("thead");
        this._Body = this._GridView.children("tbody");
        this._Foot = this._GridView.children("tfoot");

        if (this._Head !== null && typeof this._Head !== "undefined")
        {
            let OnHeadRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnHeadRightClick(this, mpos);
                return false;
            };

            this._Head.on("contextmenu", OnHeadRightClickFunc);
        }
        if (this._Body !== null && typeof this._Body !== "undefined")
        {
            let OnBodyRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnBodyRightClick(this, mpos);
                return false;
            };

            this._Body.on("contextmenu", OnBodyRightClickFunc);
        }
        if (this._Foot !== null && typeof this._Foot !== "undefined")
        {
            let OnFootRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnFootRightClick(this, mpos);
                return false;
            };

            this._Foot.on("contextmenu", OnFootRightClickFunc);
        }
        if (this._Foot !== null && typeof this._Foot !== "undefined")
        {
            let OnFootClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnFootClick(this, mpos);
            };

            this._Foot.on("click", OnFootClickFunc);
        }
    }

    get ID(): string
    {
        return this._Id;
    }

    SetHeadHTML(html: string): void
    {
        this._Head.html(html);
    }
    set AppendHead(value: string)
    {
        this._Head.append(value);
    }

    SetBodyHTML(html: string): void
    {
        this._Body.html(html);
    }
    set AppendBody(value: string)
    {
        this._Body.append(value);
    }

    SetFootHTML(html: string): void
    {
        this._Foot.html(html);
    }
    set AppendFoot(value: string)
    {
        this._Foot.append(value);
    }

    get CssClass(): string
    {
        return this._GridView.attr("class");
    }
    set CssClass(value: string)
    {
        this._GridView.removeClass();
        this._GridView.addClass(value);
    }
    RemoveCssClass(value: string): void
    {
        this._GridView.removeClass(value);
    }

    set OnFootClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnFootClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnFootClick.push(clickFunc);
        }
    }
    private BindOnFootClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnFootClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }
    remove_OnFootClick(): void
    {
        this._OnFootClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
    }

    // ヘッダーが右クリックされた際のイベントを登録する
    set OnHeadRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnHeadRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnHeadRightClick.push(clickFunc);
        }
    }
    private BindOnHeadRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnHeadRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    // 本体が右クリックされた際のイベントを登録する
    set OnBodyRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnBodyRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnBodyRightClick.push(clickFunc);
        }
    }
    private BindOnBodyRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnBodyRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    // フッターが右クリックされた際のイベントを登録する
    set OnFootRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnFootRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnFootRightClick.push(clickFunc);
        }
    }
    private BindOnFootRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnFootRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    //
    // 与えられたLabelを持つ要素が存在する<tr>に、与えられたcssクラスを設定する
    //
    SetTrCssByID(target: Label, cssClass: string): void
    {
        let objTr: JQuery = target.JElem.closest("tr");
        objTr.addClass(cssClass);
    }

    //
    // 与えられたLabelを持つ要素が存在する<tr>に、与えられたcssクラスを削除する
    //
    ClearTrCssByID(target: Label, cssClass: string): void
    {
        let objTr: JQuery = target.JElem.closest("tr");
        objTr.removeClass(cssClass);
    }
}

//
// TreeView
//
export class TreeView
{
    private _TreeView: JQuery;
    private _Head: JQuery;
    private _Body: JQuery;
    private _Foot: JQuery;
    private _NodeSpan: JQuery;
    private _Id: string;
    private _OnDrop: ((deptid: number, mpos: { x: number; y: number }) => void)[];

    constructor(id: string)
    {
        this._OnDrop = new Array<(deptid: number, mpos: { x: number; y: number }) => void>();
        this._Id = id;
        this._TreeView = $(Com.ID(id));
        this._Head = this._TreeView.children("thead");
        this._Body = this._TreeView.children("tbody");
        this._Foot = this._TreeView.children("tfoot");
    }

    get ID(): string
    {
        return this._Id;
    }

    //
    // TreeViewを表示する
    //
    Display(): void
    {
        this._TreeView.treetable({ expandable: true });
    }

    //
    // 与えられたIDのノードを展開する
    //
    ExpandNode(id: number): void
    {
        this._TreeView.treetable("expandNode", id);
    }

    //
    // 全ノードを展開する
    //
    ExpandAll(): void
    {
        this._TreeView.treetable("expandAll");
    }

    //
    // dragNodeで与えられたLabelを、dropClassを持つ要素に
    // ドラッグアンドドロップする
    //
    DragAndDrop(dragNode: Bindable<any>, dropClass: string, idattr: string): void
    {
        dragNode.JElem.draggable(
            {
                containment: 'document',
                helper: "clone",
                opacity: .75,
                refreshPositions: true,
                revert: "invalid",
                revertDuration: 300,
                scroll: true,
                cursorAt: { left: 50 },
                zIndex: 10000,
                appendTo: "body"
            });

        this._TreeView.find("tr." + dropClass).droppable(
            {
                drop: (e: Event, ui: JQueryUI.DroppableEventUIParam): void =>
                {
                    let sid: string = $(e.target).attr(idattr);
                    let getid: number = parseInt(sid);
                    if (getid !== null && typeof getid !== "undefined" && isNaN(getid) === false)
                    {
                        let pos: { x: number; y: number } = { x: ui.position.left, y: ui.position.top };
                        this.BindOnDrop(getid, pos);
                    }
                },
                hoverClass: "accept"
                //hoverClass: "accept",
                //over: (e: JQueryUI.DroppableEvents, ui: JQueryUI.DroppableEventUIParam): void =>
                //{
                //    var overEl: JQuery = ui.draggable.parents("tr");
                //    overEl.addClass("accept");
                //},
                //out: (e: JQueryUI.DroppableEvents, ui: JQueryUI.DroppableEventUIParam): void =>
                //{
                //    var outEl: JQuery = ui.draggable.parents("tr");
                //    outEl.removeClass("accept");
                //}
            });
    }

    // ドラッグアンドドロップイベントを削除する
    remove_OnDrop(): void
    {
        this._OnDrop = new Array<(deptid: number, mpos: { x: number; y: number }) => void>();
    }

    set OnDrop(func: (getid: number, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnDrop, (fvalue: ((nid: number, mpos: { x: number; y: number }) => void), index: number, array: ((nid: number, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let dropFunc = (nid: number, mpos: { x: number; y: number }): void =>
            {
                func(nid, mpos);
            };
            this._OnDrop.push(dropFunc);
        }
    }
    private BindOnDrop(getid: number, mpos: { x: number; y: number })
    {
        this._OnDrop.forEach((value: ((nid: number, mpos: { x: number; y: number }) => void), index: number, array: ((nid: number, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(getid, mpos);
            }
        });
    }

    // Nodeを取得する
    get_Node(id: number): any
    {
        return this._TreeView.treetable("node", id.toString());
    }

    // 子Nodeを追加する
    add_SubNode(prNode: any, subTr: string)
    {
        this._TreeView.treetable("loadBranch", prNode, subTr);
    }

    // 子Nodeのみ削除する
    remove_SubNode(prNode: any)
    {
        this._TreeView.treetable("unloadBranch", prNode);
    }

    // 子Nodeを移動する
    move_SubNode(crNode: any, destNode: any)
    {
        this._TreeView.treetable("move",  crNode, destNode);
    }

    SetHeadHTML(html: string): void
    {
        this._Head.html(html);
    }
    set AppendHead(value: string)
    {
        this._Head.append(value);
    }

    SetBodyHTML(html: string): void
    {
        this._Body.html(html);
    }
    set AppendBody(value: string)
    {
        this._Body.append(value);
    }

    SetFootHTML(html: string): void
    {
        this._Foot.html(html);
    }
    set AppendFoot(value: string)
    {
        this._Foot.append(value);
    }

    get CssClass(): string
    {
        return this._TreeView.attr("class");
    }
    set CssClass(value: string)
    {
        this._TreeView.removeClass();
        this._TreeView.addClass(value);
    }
    RemoveCssClass(value: string): void
    {
        this._TreeView.removeClass(value);
    }

    set OnNodeClick(func: () => void)
    {
        this._NodeSpan = this._TreeView.find("tr > td > span[onclick='true']");
        this._NodeSpan.on("click", (eventObject: JQuery.Event, ...args: any[]): any =>
        {
        });
    }
}

//
// DataTable
//
export class DataTable
{
    private _DataTable: JQuery;
    private _DataTableCore: DataTables.Api;
    private _Head: JQuery;
    private _Body: JQuery;
    private _Foot: JQuery;
    private _NodeSpan: JQuery;
    private _Id: string;
    private _OnDrop: ((deptid: number, mpos: { x: number; y: number }) => void)[];
    private _OnHeadRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];
    private _OnBodyRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];
    private _OnFootRightClick: ((target: any, mpos: { x: number; y: number }) => void)[];

    constructor(id: string)
    {
        this._OnDrop = new Array<(deptid: number, mpos: { x: number; y: number }) => void>();
        this._OnHeadRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
        this._OnBodyRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
        this._OnFootRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();

        this._Id = id;
        this._DataTable = $(Com.ID(id));
        this._Head = this._DataTable.children("thead");
        this._Body = this._DataTable.children("tbody");
        this._Foot = this._DataTable.children("tfoot");

        if (this._Head !== null && typeof this._Head !== "undefined")
        {
            let OnHeadRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnHeadRightClick(this, mpos);
                return false;
            };

            this._Head.on("contextmenu", OnHeadRightClickFunc);
        }
        if (this._Body !== null && typeof this._Body !== "undefined")
        {
            let OnBodyRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnBodyRightClick(this, mpos);
                return false;
            };

            this._Body.on("contextmenu", OnBodyRightClickFunc);
        }
        if (this._Foot !== null && typeof this._Foot !== "undefined")
        {
            let OnFootRightClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnFootRightClick(this, mpos);
                return false;
            };

            this._Foot.on("contextmenu", OnFootRightClickFunc);
        }
    }

    get ID(): string
    {
        return this._Id;
    }

    //
    // DataTableを表示する
    //
    Display(prop: Object = null): void
    {
        if (prop === null)
        {
            this._DataTableCore = this._DataTable.DataTable();
        }
        else
        {
            this._DataTableCore = this._DataTable.DataTable(prop);
        }
    }

    //
    // DataTableが存在するかどうかを返す
    //
    IsValid(): boolean
    {
        return $.fn.dataTable.isDataTable(Com.ID(this._Id));
    }

    //
    // DataTableの全データを消去する
    //
    ClearAll(): void
    {
        this._DataTableCore.clear();
    }

    //
    // DataTableに行を追加する
    //
    add_Rows(rowdata: string[][]): void
    {
        this._DataTableCore.rows.add(rowdata);
    }

    //
    // DataTableに行を追加する
    //
    add_Row(rowdata: string[]): void
    {
        this._DataTableCore.row.add(rowdata);
    }

    //
    // DataTableの全データを表示する
    //
    Draw(): void
    {
        this._DataTableCore.draw();
    }

    ////
    //// DataTableを再表示する
    ////
    //ReDraw(prop: Object = null): void
    //{
    //    this._DataTable = null;
    //    this._DataTableCore = null;

    //    if (prop === null)
    //    {
    //        this._DataTable = $(Com.ID(this._Id));
    //        this._DataTableCore = this._DataTable.DataTable();
    //    }
    //    else
    //    {
    //        this._DataTable = $(Com.ID(this._Id));
    //        this._DataTableCore = this._DataTable.DataTable(prop);
    //    }
    //}

    //
    // dragNodeで与えられたLabelを、dropClassを持つ要素に
    // ドラッグアンドドロップする
    //
    DragAndDrop(dragNode: Bindable<any>, dropClass: string, idattr: string): void
    {
        dragNode.JElem.draggable(
            {
                helper: "clone",
                opacity: .75,
                refreshPositions: true,
                revert: "invalid",
                revertDuration: 300,
                scroll: true
            });

        this._DataTable.find("." + dropClass).droppable(
            {
                drop: (e: Event, ui: JQueryUI.DroppableEventUIParam): void =>
                {
                    let sid: string = $(e.target).attr(idattr);
                    let getid: number = parseInt(sid);
                    if (getid !== null && typeof getid !== "undefined" && isNaN(getid) === false)
                    {
                        let pos: { x: number; y: number } = { x: ui.position.left, y: ui.position.top };
                        this.BindOnDrop(getid, pos);
                    }
                },
                hoverClass: "accept"
            });
    }

    // ドラッグアンドドロップイベントを削除する
    remove_OnDrop(): void
    {
        this._OnDrop = new Array<(deptid: number, mpos: { x: number; y: number }) => void>();
    }

    // ドラッグアンドドロップイベントを登録する
    set OnDrop(func: (getid: number, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnDrop, (fvalue: ((nid: number, mpos: { x: number; y: number }) => void), index: number, array: ((nid: number, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let dropFunc = (nid: number, mpos: { x: number; y: number }): void =>
            {
                func(nid, mpos);
            };
            this._OnDrop.push(dropFunc);
        }
    }
    private BindOnDrop(getid: number, mpos: { x: number; y: number })
    {
        this._OnDrop.forEach((value: ((nid: number, mpos: { x: number; y: number }) => void), index: number, array: ((nid: number, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(getid, mpos);
            }
        });
    }

    // ヘッダーが右クリックされた際のイベントを登録する
    set OnHeadRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnHeadRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnHeadRightClick.push(clickFunc);
        }
    }
    private BindOnHeadRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnHeadRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    // 本体が右クリックされた際のイベントを登録する
    set OnBodyRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnBodyRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnBodyRightClick.push(clickFunc);
        }
    }
    private BindOnBodyRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnBodyRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    // フッターが右クリックされた際のイベントを登録する
    set OnFootRightClick(func: (target: any, pos: { x: number; y: number }) => void)
    {
        let target = Common.find(this._OnFootRightClick, (fvalue: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (target === null || typeof target === "undefined")
        {
            let clickFunc = (target: any, mpos: { x: number; y: number }): void =>
            {
                func(target, mpos);
            };
            this._OnFootRightClick.push(clickFunc);
        }
    }
    private BindOnFootRightClick(elem: any, mpos: { x: number; y: number })
    {
        elem._OnFootRightClick.forEach((value: ((target: any, mpos: { x: number; y: number }) => void), index: number, array: ((target: any, mpos: { x: number; y: number }) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos);
            }
        });
    }

    remove_OnHeadRightClick(): void
    {
        this._OnHeadRightClick = new Array<(target: any, mpos: { x: number; y: number }) => void>();
    }

    SetHeadHTML(html: string): void
    {
        this._Head.html(html);
    }
    set AppendHead(value: string)
    {
        this._Head.append(value);
    }

    SetBodyHTML(html: string): void
    {
        this._Body.html(html);
    }
    set AppendBody(value: string)
    {
        this._Body.append(value);
    }

    SetFootHTML(html: string): void
    {
        this._Foot.html(html);
    }
    set AppendFoot(value: string)
    {
        this._Foot.append(value);
    }

    get CssClass(): string
    {
        return this._DataTable.attr("class");
    }
    set CssClass(value: string)
    {
        this._DataTable.addClass(value);
    }
    RemoveCssClass(value: string): void
    {
        this._DataTable.removeClass(value);
    }

    //
    // 与えられたLabelを持つ要素が存在する<tr>に、与えられたcssクラスを設定する
    //
    SetTrCssByID(target: Label, cssClass: string): void
    {
        let objTr: JQuery = target.JElem.closest("tr");
        objTr.addClass(cssClass);
    }

    //
    // 与えられたLabelを持つ要素が存在する<tr>に、与えられたcssクラスを削除する
    //
    ClearTrCssByID(target: Label, cssClass: string): void
    {
        let objTr: JQuery = target.JElem.closest("tr");
        objTr.removeClass(cssClass);
    }
}


//
// Table
//
export class Table
{
    private _Id: string;
    private _CssClass: string[];
    private _colHdTr: Tr[];
    private _colBdTr: Tr[];

    constructor()
    {
        this._colHdTr = new Array<Tr>();
        this._colBdTr = new Array<Tr>();
        this._CssClass = new Array<string>();
    }

    set Id(id: string)
    {
        this._Id = id;
    }

    set_Head(value: Tr)
    {
        this._colHdTr.push(value);
    }

    set_Body(value: Tr)
    {
        this._colBdTr.push(value);
    }

    set CssClass(value: string)
    {
        this._CssClass.push(value);
    }
    RemoveCssClass(value: string): void
    {
        this._CssClass.some((csclass: string, index: number, array: string[]): boolean =>
        {
            if (csclass === value)
            {
                this._CssClass.splice(index, 1);
                return true;
            }
            else
            {
                return false;
            }
        });
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = this._CssClass.join(" ");
        let strHdTrContent = "";
        this._colHdTr.forEach((value: Tr, index: number, array: Tr[]): void =>
        {
            strHdTrContent += value.ToString();
        })
        let strBdTrContent = "";
        this._colBdTr.forEach((value: Tr, index: number, array: Tr[]): void =>
        {
            strBdTrContent += value.ToString();
        })

        if (this._Id !== null && this._Id.length > 0)
        {
            strOut = "<tbale id='" + this._Id + "' class='" + strCss + "'><thead>" + strHdTrContent + "</thead><tbody>" + strBdTrContent + "</tbody></table>";
        }
        else
        {
            strOut = "<table class='" + strCss + "'><thead>" + strHdTrContent + "</thead><tbody>" + strBdTrContent + "</tbody></table>";
        }
        return strOut;
    }
}

//
// iframe
//
export class Iframe
{
    private _Iframe: JQuery;
    private _Id: string;
    private _Src: string;
    private _Width: number;
    private _Height: number;
    private IsOpen: boolean;

    constructor(id: string)
    {
        this._Id = id;
        this._Iframe = (id !== null) ? $(Com.ID(id)) : null;
        this.IsOpen = false;
    }

    get ID(): string
    {
        return this._Id;
    }

    Prepare(src: string = null, width: number = null, height: number = null): void
    {
        if (src != null)
        {
            this.Src = src;
        }
        if (width != null)
        {
            this.Width = width;
        }
        if (height != null)
        {
            this.Height = height;
        }
    }

    Show(): void
    {
        this._Iframe.removeClass("closed");
        this.IsOpen = true;
    }

    Hide(): void
    {
        this._Iframe.addClass("closed");
        this.IsOpen = false;
    }

    set Src(src: string)
    {
        if (this._Iframe !== null && typeof this._Iframe !== "undefined")
        {
            this._Iframe.attr("src", "");
            this._Iframe.attr("src", src);
        }
    }

    set Width(value: number)
    {
        if (this._Iframe !== null && typeof this._Iframe !== "undefined")
        {
            this._Iframe.css("width", value.toString() + "px");
        }
    }

    set Height(value: number)
    {
        if (this._Iframe !== null && typeof this._Iframe !== "undefined")
        {
            this._Iframe.css("height", value.toString() + "px");
        }
    }

    Close(): void
    {
        if (this.IsOpen === true)
        {
            this.IsOpen = false;
        }
        this._Iframe.addClass("closed");
    }
}

//
// Element
//
export abstract class Element
{
    protected _Id: string;
    protected _JElem: JQuery;
    protected _Content: Elem[];
    protected _Text: string;
    protected _CssClass: string[];
    protected _Attribute: { key: string; value: string }[];
    private _Origin: Object;                // コンポーネントと紐づけるオブジェクト
    private _OnClick: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnRightButtonClick: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnMouseEnter: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[];
    private _OnMouseLeave: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[];

    constructor(id: string = null, je: boolean = false, origin: Object = null)
    {
        this._OnClick = new Array<(target: Element, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnRightButtonClick = new Array<(target: Element, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnMouseEnter = new Array<(target: Element, mpos: { x: number; y: number }, origin: Object) => void>();
        this._OnMouseLeave = new Array<(target: Element, mpos: { x: number; y: number }, origin: Object) => void>();
        this._Id = id;
        this._JElem = (je == true && id !== null) ? $(Com.ID(id)) : null;
        this._Origin = origin;
        this._Content = new Array<Elem>();
        this._Text = "";
        this._CssClass = new Array<string>();
        this._Attribute = new Array<{ key: string; value: string }>();
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let OnClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnClick(this, mpos);
            };
            let OnRightButtonClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnRightButtonClick(this, mpos);
                return false;
            };
            let OnMouseEnter = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnMouseEnter(this, mpos);
            };
            let OnMouseLeave = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnMouseLeave(this, mpos);
            };

            this._JElem.on("click", OnClickFunc);
            // 右クリック
            this._JElem.on('contextmenu', OnRightButtonClickFunc);
            // Mouse Enter
            this._JElem.on('mouseenter', OnMouseEnter);
            // Mouse Leave
            this._JElem.on('mouseleave', OnMouseLeave);
        }
    }

    get JElem(): JQuery
    {
        return this._JElem;
    }

    set Id(id: string)
    {
        this._Id = id;
    }

    set_Content(value: Elem)
    {
        this._Content.push(value);
    }

    clear_Content()
    {
        this._Content.splice(0, this._Content.length);
    }

    set OnClick(func: (target: Element, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnClick, (fvalue: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnClick.push(func);
        }
    }
    private BindOnClick(elem: Element, mpos: { x: number; y: number })
    {
        elem._OnClick.forEach((value: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnRightButtonClick(func: (target: Element, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnRightButtonClick, (fvalue: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnRightButtonClick.push(func);
        }
    }
    private BindOnRightButtonClick(elem: Element, mpos: { x: number; y: number })
    {
        elem._OnRightButtonClick.forEach((value: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnMouseEnter(func: (target: Element, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnMouseEnter, (fvalue: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnMouseEnter.push(func);
        }
    }
    private BindOnMouseEnter(elem: Element, mpos: { x: number; y: number })
    {
        elem._OnMouseEnter.forEach((value: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set OnMouseLeave(func: (target: Element, pos: { x: number; y: number }, origin: Object) => void)
    {
        let ctarget = Common.find(this._OnMouseLeave, (fvalue: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): boolean =>
        {
            if (func === fvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (ctarget === null || typeof ctarget === "undefined")
        {
            this._OnMouseLeave.push(func);
        }
    }
    private BindOnMouseLeave(elem: Element, mpos: { x: number; y: number })
    {
        elem._OnMouseLeave.forEach((value: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void), index: number, array: ((target: Element, mpos: { x: number; y: number }, origin: Object) => void)[]): void =>
        {
            if (value !== null && typeof value !== "undefined")
            {
                value(elem, mpos, elem._Origin);
            }
        });
    }

    set Text(value: string)
    {
        this._Text = value;
    }

    get Height(): number
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.height();
        }
        else
        {
            return 0;
        }
    }

    set Height(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            //this._JElem.height(value);
            this._JElem.css("height", value.toString() + "px");
        }
    }

    get Width(): number
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            return this._JElem.width();
        }
        else
        {
            return 0;
        }
    }

    set Width(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            //this._JElem.height(value);
            this._JElem.css("width", value.toString() + "px");
        }
    }

    set MaxWidth(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.css("max-width", value.toString() + "px");
        }
    }

    set MinWidth(value: number)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.css("min-width", value.toString() + "px");
        }
    }

    set CssClass(value: string)
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.addClass(value);
        }

        let cssClass = Common.find(this._CssClass, (cvalue: string, index: number, array: string[]): boolean =>
        {
            if (value === cvalue)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        if (cssClass === null || typeof cssClass === "undefined")
        {
            this._CssClass.push(value);
        }
    }
    remove_CssClass(value: string): void
    {
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            this._JElem.removeClass(value);
        }

        this._CssClass.some((csclass: string, index: number, array: string[]): boolean =>
        {
            if (csclass === value)
            {
                this._CssClass.splice(index, 1);
                return true;
            }
            else
            {
                return false;
            }
        });
    }

    set Attribute(attr: { key: string; value: string })
    {
        let target: { key: string; value: string } = null;
        target = Common.find(this._Attribute, (avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): boolean =>
        {
            if (avalue.key === attr.key)
            {
                return true;
            }
            else
            {
                return false;
            }
        });

        if (target !== null && typeof target !== "undefined")
        {
            target.value += " " + attr.value;
        }
        else
        {
            this._Attribute.push(attr);
        }
    }

    ToString(type: string): string
    {
        let strOut = "";
        let strCss = (this._CssClass.length > 0) ? " class='" + this._CssClass.join(" ") + "'" : "";
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });
        let strContent = "";
        this._Content.forEach((value: Elem, index: number, array: Elem[]): void =>
        {
            strContent += value.ToString();
        })

        if (this._Id !== null && this._Id.length > 0 && typeof this._Id !== "undefined")
        {
            strOut = "<" + type + " id='" + this._Id + "'" + strCss + strAttribute + ">" + Common.HtmlEscape(this._Text) + strContent + "</" + type + ">";
        }
        else
        {
            strOut = "<" + type + strCss + strAttribute + ">" + Common.HtmlEscape(this._Text) + strContent + "</" + type + ">";
        }
        return strOut;
    }

    RefJQ(): void
    {
        this._JElem = (this._Id !== null) ? $(Com.ID(this._Id)) : null;
        if (this._JElem !== null && typeof this._JElem !== "undefined" && this._JElem.length > 0)
        {
            let OnClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnClick(this, mpos);
            };
            let OnRightButtonClickFunc = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnRightButtonClick(this, mpos);
                return false;
            };
            let OnMouseEnter = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnMouseEnter(this, mpos);
            };
            let OnMouseLeave = (eventObject: JQuery.Event, ...args: any[]): any =>
            {
                let mpos: { x: number; y: number } = { x: 0, y: 0 };
                mpos.x = eventObject.clientX;
                mpos.y = eventObject.clientY;
                this.BindOnMouseLeave(this, mpos);
            };

            this._JElem.on("click", OnClickFunc);
            // 右クリック
            this._JElem.on('contextmenu', OnRightButtonClickFunc);
            // Mouse Enter
            this._JElem.on('mouseenter', OnMouseEnter);
            // Mouse Leave
            this._JElem.on('mouseleave', OnMouseLeave);
        }
    }

    Show(): void
    {
        this._JElem.show();
    }

    Hide(): void
    {
        this._JElem.hide();
    }
}

//
// Tr
//
export class Tr extends Element implements Elem
{
    constructor(id: string = null, je: boolean = false)
    {
        super(id, je);
    }

    ToString(): string
    {
        return super.ToString("tr");
    }
}

//
// Td
//
export class Td extends Element implements Elem
{
    constructor(id: string = null)
    {
        super(id);
    }

    ToString(): string
    {
        return super.ToString("td");
    }
}

//
// Th
//
export class Th extends Element implements Elem
{
    constructor(id: string = null)
    {
        super(id);
    }

    ToString(): string
    {
        return super.ToString("th");
    }
}

//
// Ul
//
export class Ul extends Element implements Elem
{
    constructor(id: string = null)
    {
        super(id);
    }

    ToString(): string
    {
        return super.ToString("ul");
    }
}

//
// Li
//
export class Li extends Element implements Elem
{
    constructor(id: string = null)
    {
        super(id);
    }

    ToString(): string
    {
        return super.ToString("li");
    }
}

//
// Div
//
export class Div extends Element implements Elem
{
    constructor(id: string = null, je: boolean = false)
    {
        super(id, je);
    }

    ToString(): string
    {
        return super.ToString("div");
    }
}

//
// Span
//
export class Span extends Element implements Elem
{
    constructor(id: string = null)
    {
        super(id);
    }

    ToString(): string
    {
        return super.ToString("span");
    }
}

//
// Image
//
export class Image extends Element implements Elem
{
    constructor(id: string = null, url: string = "", alt: string = "", title: string = "")
    {
        super(id);
        this.Attribute = { key: "src", value: url };
        if (alt.length > 0)
        {
            this.Attribute = { key: "alt", value: alt };
        }
        if (title.length > 0)
        {
            this.Attribute = { key: "title", value: title };
        }
    }

    ToString(): string
    {
        let strOut = "";
        let strCss = this._CssClass.join(" ");
        let strAttribute = "";
        this._Attribute.forEach((avalue: { key: string; value: string }, index: number, array: { key: string; value: string }[]): void =>
        {
            strAttribute += " " + avalue.key + "='" + avalue.value + "'";
        });

        if (this._Id !== null && this._Id.length > 0)
        {
            strOut = "<img id='" + this._Id + "' class='" + strCss + "'" + strAttribute + "/>";
        }
        else
        {
            strOut = "<img class='" + strCss + "'" + strAttribute + "/>";
        }
        return strOut;
    }
}

//
// idを補正
//
export class Com
{
    static ID(id): string
    {
        let reg = /^[a-zA-Z0-9]/i
        if (id.search(reg) >= 0)
        {
            reg = /^(div#|div\.|div\[|span#|span\.|span\[|a#|a\.|a\[)/i
            if (id.search(reg) >= 0)
            {
                return id;
            }
            else
            {
                return "#" + id;
            }
        }
        else
        {
            return id;
        }
    }
}
