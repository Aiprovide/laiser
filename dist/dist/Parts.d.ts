/// <reference types="jquery" />
/// <reference types="datatables.net" />
/// <reference types="jquery.myself" />
/// <reference types="jqueryui" />
import "Promise";
import "jquery-ui-bundle";
import "jquery-treetable";
import "datatables.net";
export declare class BData<T> {
    private _Value;
    private _Bind;
    constructor();
    Text: string;
    Value: T;
    Bind: Bindable<T>;
    private Binding();
    OnBind(value: Bindable<T>): void;
}
export interface Elem {
    ToString(): string;
}
export declare abstract class Bindable<T> {
    private _Parent;
    protected _JElem: JQuery;
    protected _Id: string;
    protected _Value: any;
    protected _CssClass: string[];
    protected _Attribute: {
        key: string;
        value: string;
    }[];
    private _AutoRef;
    private _TwoWayRef;
    private _Origin;
    static isClicked: boolean;
    private _OnClick;
    private _OnDoubleClick;
    private _OnRightButtonClick;
    private _OnChange;
    private _OnSpinChange;
    private _BData;
    protected _BmText: (value: any) => void;
    protected _BmCss: (value: any) => void;
    protected _BmTextCss: (value: any) => void;
    constructor(id?: string, parent?: any, je?: boolean, autoref?: boolean, origin?: Object);
    readonly JElem: JQuery;
    ID: string;
    readonly Parent: any;
    readonly AutoRef: boolean;
    readonly TwoWayRef: boolean;
    set_Bind(value: BData<T>, twoway?: boolean): void;
    get_Bind(): BData<T>;
    set_Text(value: T): void;
    BmText: (value: T) => void;
    set_Css(value: T): void;
    BmCss: (value: T) => void;
    set_TextCss(value: T): void;
    BmTextCss: (value: T) => void;
    OnClick: (target: Bindable<T>, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnClick(elem, mpos);
    OnDoubleClick: (target: Bindable<T>, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnDoubleClick(elem, mpos);
    OnRightButtonClick: (target: Bindable<T>, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnRightButtonClick(elem, mpos);
    OnChange: (target: Bindable<T>, origin: Object) => void;
    private BindOnChange(elem);
    OnSpinChange: (target: Bindable<T>, origin: Object) => void;
    private BindOnSpinChange(elem);
    RefJQ(): void;
    SetHTML(html: string): void;
    get_Value(): any;
    set_Value(value: any): void;
    Text: string;
    Append(value: string): void;
    CssClass: string;
    remove_CssClass(value: string): void;
    removeAll_CssClass(): void;
    Attribute: {
        key: string;
        value: string;
    };
    Show(): void;
    Hide(): void;
    Height: number;
    Width: number;
    MaxWidth: number;
    MinWidth: number;
}
export declare class HTMLWindow {
    private _OnResize;
    private _OnWiderResize;
    private _OnNarrowResize;
    private _OnHigherResize;
    private _OnLowResize;
    private _OnUnload;
    private timer;
    private oldWindowSize;
    constructor();
    OnResize: () => void;
    private BindOnResize(elem);
    OnWiderResize: () => void;
    private BindOnWiderResize(elem);
    OnNarrowResize: () => void;
    private BindOnNarrowResize(elem);
    OnHigherResize: () => void;
    private BindOnHigherResize(elem);
    OnLowResize: () => void;
    private BindOnLowResize(elem);
    OnUnload: () => void;
    private BindOnUnload(elem);
    static get_Position(): {
        x: number;
        y: number;
    };
    static set_Position(value: {
        x: number;
        y: number;
    }): void;
    static get_Size(): {
        width: number;
        height: number;
    };
    static set_Size(value: {
        width: number;
        height: number;
    }): void;
    static get_InnerSize(): {
        width: number;
        height: number;
    };
}
export declare class HTMLBody {
    private _JElem;
    private _S4Workspace;
    private _CssClass;
    private _Attribute;
    private _OnClick;
    private _OnRightButtonClick;
    constructor();
    readonly JElem: JQuery;
    CssClass: string;
    remove_CssClass(value: string): void;
    removeAll_CssClass(): void;
    Attribute: {
        key: string;
        value: string;
    };
    Height: number;
    readonly Width: number;
    S4Workspace_Width: number;
    S4Workspace_Height: number;
    OnClick: (target: HTMLBody, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnClick(elem, mpos);
    OnRightButtonClick: (target: HTMLBody, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnRightButtonClick(elem, mpos);
}
export declare class Label extends Bindable<any> implements Elem {
    private _Type;
    constructor(id?: string, parent?: any, je?: boolean, type?: string);
    ToString(): string;
    set_Text(value: any): void;
    set_Css(value: any): void;
    set_TextCss(value: any): void;
}
export declare class Button {
    private _Button;
    private _Id;
    constructor(id: string);
    readonly ID: string;
    Text: string;
    OnClick: () => void;
    Show(): void;
    Hide(): void;
}
export declare class TextBox extends Bindable<any> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    Text: any;
    ToString(): string;
    set_Text(value: any): void;
    set_Css(value: any): void;
    set_TextCss(value: any): void;
}
export declare class TextArea extends Bindable<string> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    ToString(): string;
    Text: string;
    set_Text(value: string): void;
    set_Css(value: string): void;
    set_TextCss(value: string): void;
}
export declare class CheckBox extends Bindable<boolean> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    get_Value(): boolean;
    set_Value(value: boolean): void;
    ToString(): string;
    set_Text(value: boolean): void;
    set_Css(value: boolean): void;
    set_TextCss(value: boolean): void;
}
export declare class DropDownList extends Bindable<number> implements Elem {
    private _Items;
    constructor(id?: string, parent?: any, je?: boolean);
    add_Item(item: {
        value: string;
        title: string;
    }): void;
    get_Value(): number;
    set_Value(value: number): void;
    ToString(): string;
    set_Text(value: number): void;
    set_Css(value: number): void;
    set_TextCss(value: number): void;
}
export declare class RadioButtonList extends Bindable<number> implements Elem {
    private _Items;
    constructor(id?: string, parent?: any, je?: boolean);
    add_Item(item: {
        value: string;
        title: string;
    }): void;
    get_Value(): number;
    set_Value(value: number): void;
    ToString(): string;
    set_Text(value: number): void;
    set_Css(value: number): void;
    set_TextCss(value: number): void;
}
export declare class DatePicker extends Bindable<Date> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    RefJQ(): void;
    get_Value(): Date;
    set_Value(value: Date): void;
    Text: string;
    ToString(): string;
    set_Text(value: Date): void;
    set_Css(value: Date): void;
    set_TextCss(value: Date): void;
}
export declare class Spinner extends Bindable<number> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    RefJQ(): void;
    get_Value(): number;
    set_Value(value: number): void;
    ToString(): string;
    set_Text(value: number): void;
    set_Css(value: number): void;
    set_TextCss(value: number): void;
}
export declare class FileUpload extends Bindable<any> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    readonly File: File;
    readonly FileName: string;
    ReadAsText(): Promise<string>;
    ReadAsBinary(): Promise<any>;
    ToString(): string;
}
export declare class MultiFilesUpload extends Bindable<any> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    readonly Files: File[];
    get_FileName(file: File): string;
    ReadAsText(file: File): Promise<string>;
    ReadAsBinary(file: File): Promise<any>;
    ToString(): string;
}
export declare class MultiFilesDropArea extends Bindable<any> implements Elem {
    private _Files;
    private _OnDrop;
    private _OnDragEnter;
    private _OnDragLeave;
    private top;
    private left;
    private height;
    private width;
    private isEnter;
    private _area;
    constructor(id: string, parent: any, je: boolean, backareaId: string);
    readonly Files: File[];
    get_FileName(file: File): string;
    ReadAsText(file: File): Promise<string>;
    ReadAsBinary(file: File): Promise<any>;
    remove_OnDrop(): void;
    OnDrop: (dropFiles: File[], pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnDrop(mpos);
    remove_OnDragEnter(): void;
    OnDragEnter: (pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnDragEnter(mpos);
    remove_OnDragLeave(): void;
    OnDragLeave: (pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnDragLeave(mpos);
    CssClass: string;
    RemoveCssClass(value: string): void;
    ToString(): string;
}
export declare class ImageArea extends Bindable<any> implements Elem {
    constructor(id?: string, parent?: any, je?: boolean);
    Draw(url: string, alt?: string, title?: string): void;
    ToString(): string;
    set_Css(value: string): void;
}
export declare class Dialog {
    protected _Dialog: JQuery;
    protected _Id: string;
    private _OnBlur;
    private OpenTime;
    private top;
    private left;
    private height;
    private width;
    private _area;
    constructor(id: string, backareaId: string);
    readonly ID: string;
    Open(pos: {
        x: number;
        y: number;
    }): void;
    Close(): void;
    RefJQ(): void;
    OnBlur: () => void;
    private BindOnBlur();
}
export declare class UIDialogBox {
    protected _Dialog: JQuery;
    protected _Id: string;
    protected _Title: string;
    protected _TitleCss: string;
    private IsOpen;
    private _OnClose;
    constructor(id: string, title?: string, titleCss?: string);
    readonly ID: string;
    Title: string;
    TitleCss: string;
    Open(pos: {
        x: number;
        y: number;
    }, iwidth?: string, titleCss?: string, removeTitleCss?: string, enableTitleCss?: boolean): void;
    Close(): void;
    OnClose: () => void;
    private BindOnClose();
}
export declare class UITab {
    private _Tab;
    private _Id;
    private IsOpen;
    constructor(id: string);
    readonly ID: string;
    Open(): void;
    Active(tabnum: number): void;
    Close(): void;
}
export declare class Menu extends Dialog {
    private _Menu;
    private _Ul;
    private _Div;
    constructor(id: string, backareaID: string);
    readonly ID: string;
    add_Menu(item: {
        title: string;
        func: (target: any, pos: {
            x: number;
            y: number;
        }) => void;
    }): void;
    clear_Menu(): void;
    Open(pos: {
        x: number;
        y: number;
    }): void;
    RefJQ(): void;
}
export declare class Breadcrumb implements Elem {
    protected _Id: string;
    private _Breadcrumb;
    private _Div;
    private Crumb;
    private _Sp;
    constructor(id: string, sp: string);
    readonly ID: string;
    add_TopCrumb(item: {
        title: string;
        func: (target: any, pos: {
            x: number;
            y: number;
        }, origin: Object) => void;
    }): void;
    add_NextCrumb(item: {
        title: string;
        func: (target: any, pos: {
            x: number;
            y: number;
        }, origin: Object) => void;
    }): void;
    remove_AllCrumb(): void;
    ToString(): string;
    Open(): void;
    RefJQ(): void;
}
export declare class GridView {
    private _GridView;
    private _Head;
    private _Body;
    private _Foot;
    private _Id;
    private _OnFootClick;
    private _OnHeadRightClick;
    private _OnBodyRightClick;
    private _OnFootRightClick;
    constructor(id: string);
    readonly ID: string;
    SetHeadHTML(html: string): void;
    AppendHead: string;
    SetBodyHTML(html: string): void;
    AppendBody: string;
    SetFootHTML(html: string): void;
    AppendFoot: string;
    CssClass: string;
    RemoveCssClass(value: string): void;
    OnFootClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnFootClick(elem, mpos);
    remove_OnFootClick(): void;
    OnHeadRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnHeadRightClick(elem, mpos);
    OnBodyRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnBodyRightClick(elem, mpos);
    OnFootRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnFootRightClick(elem, mpos);
    SetTrCssByID(target: Label, cssClass: string): void;
    ClearTrCssByID(target: Label, cssClass: string): void;
}
export declare class TreeView {
    private _TreeView;
    private _Head;
    private _Body;
    private _Foot;
    private _NodeSpan;
    private _Id;
    private _OnDrop;
    constructor(id: string);
    readonly ID: string;
    Display(): void;
    ExpandNode(id: number): void;
    ExpandAll(): void;
    DragAndDrop(dragNode: Bindable<any>, dropClass: string, idattr: string): void;
    remove_OnDrop(): void;
    OnDrop: (getid: number, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnDrop(getid, mpos);
    get_Node(id: number): any;
    add_SubNode(prNode: any, subTr: string): void;
    remove_SubNode(prNode: any): void;
    move_SubNode(crNode: any, destNode: any): void;
    SetHeadHTML(html: string): void;
    AppendHead: string;
    SetBodyHTML(html: string): void;
    AppendBody: string;
    SetFootHTML(html: string): void;
    AppendFoot: string;
    CssClass: string;
    RemoveCssClass(value: string): void;
    OnNodeClick: () => void;
}
export declare class DataTable {
    private _DataTable;
    private _DataTableCore;
    private _Head;
    private _Body;
    private _Foot;
    private _NodeSpan;
    private _Id;
    private _OnDrop;
    private _OnHeadRightClick;
    private _OnBodyRightClick;
    private _OnFootRightClick;
    constructor(id: string);
    readonly ID: string;
    Display(prop?: Object): void;
    IsValid(): boolean;
    ClearAll(): void;
    add_Rows(rowdata: string[][]): void;
    add_Row(rowdata: string[]): void;
    Draw(): void;
    DragAndDrop(dragNode: Bindable<any>, dropClass: string, idattr: string): void;
    remove_OnDrop(): void;
    OnDrop: (getid: number, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnDrop(getid, mpos);
    OnHeadRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnHeadRightClick(elem, mpos);
    OnBodyRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnBodyRightClick(elem, mpos);
    OnFootRightClick: (target: any, pos: {
        x: number;
        y: number;
    }) => void;
    private BindOnFootRightClick(elem, mpos);
    remove_OnHeadRightClick(): void;
    SetHeadHTML(html: string): void;
    AppendHead: string;
    SetBodyHTML(html: string): void;
    AppendBody: string;
    SetFootHTML(html: string): void;
    AppendFoot: string;
    CssClass: string;
    RemoveCssClass(value: string): void;
    SetTrCssByID(target: Label, cssClass: string): void;
    ClearTrCssByID(target: Label, cssClass: string): void;
}
export declare class Table {
    private _Id;
    private _CssClass;
    private _colHdTr;
    private _colBdTr;
    constructor();
    Id: string;
    set_Head(value: Tr): void;
    set_Body(value: Tr): void;
    CssClass: string;
    RemoveCssClass(value: string): void;
    ToString(): string;
}
export declare class Iframe {
    private _Iframe;
    private _Id;
    private _Src;
    private _Width;
    private _Height;
    private IsOpen;
    constructor(id: string);
    readonly ID: string;
    Prepare(src?: string, width?: number, height?: number): void;
    Show(): void;
    Hide(): void;
    Src: string;
    Width: number;
    Height: number;
    Close(): void;
}
export declare abstract class Element {
    protected _Id: string;
    protected _JElem: JQuery;
    protected _Content: Elem[];
    protected _Text: string;
    protected _CssClass: string[];
    protected _Attribute: {
        key: string;
        value: string;
    }[];
    private _Origin;
    private _OnClick;
    private _OnRightButtonClick;
    private _OnMouseEnter;
    private _OnMouseLeave;
    constructor(id?: string, je?: boolean, origin?: Object);
    readonly JElem: JQuery;
    Id: string;
    set_Content(value: Elem): void;
    clear_Content(): void;
    OnClick: (target: Element, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnClick(elem, mpos);
    OnRightButtonClick: (target: Element, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnRightButtonClick(elem, mpos);
    OnMouseEnter: (target: Element, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnMouseEnter(elem, mpos);
    OnMouseLeave: (target: Element, pos: {
        x: number;
        y: number;
    }, origin: Object) => void;
    private BindOnMouseLeave(elem, mpos);
    Text: string;
    Height: number;
    Width: number;
    MaxWidth: number;
    MinWidth: number;
    CssClass: string;
    remove_CssClass(value: string): void;
    Attribute: {
        key: string;
        value: string;
    };
    ToString(type: string): string;
    RefJQ(): void;
    Show(): void;
    Hide(): void;
}
export declare class Tr extends Element implements Elem {
    constructor(id?: string, je?: boolean);
    ToString(): string;
}
export declare class Td extends Element implements Elem {
    constructor(id?: string);
    ToString(): string;
}
export declare class Th extends Element implements Elem {
    constructor(id?: string);
    ToString(): string;
}
export declare class Ul extends Element implements Elem {
    constructor(id?: string);
    ToString(): string;
}
export declare class Li extends Element implements Elem {
    constructor(id?: string);
    ToString(): string;
}
export declare class Div extends Element implements Elem {
    constructor(id?: string, je?: boolean);
    ToString(): string;
}
export declare class Span extends Element implements Elem {
    constructor(id?: string);
    ToString(): string;
}
export declare class Image extends Element implements Elem {
    constructor(id?: string, url?: string, alt?: string, title?: string);
    ToString(): string;
}
export declare class Com {
    static ID(id: any): string;
}
