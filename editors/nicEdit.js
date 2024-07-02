/* NicEdit - Micro Inline WYSIWYG
 * Copyright 2007-2008 Brian Kirchoff
 *
 * NicEdit is distributed under the terms of the MIT license
 * For more information visit http://nicedit.com/
 * Do not remove this copyright message
 * 
 * NicEdit extended (ver. 1.3)
 * by Lead Pepelats ( http://lead-pepelats.ru/blog/tag/NicEdit/ ), ©2013-2015
 * - Translated into Russian language
 * - Modified table of colors (ColorButton)
 * - Added management by attributes `width`, `height`, `hspace`, `vspace` and `style` for images (ImageButton) 
 * - Added `Manager of Images` (ImgsMgrButton)
 * - Added management by tables (TableButton)
 * - Added support for callback function (instance_callback)
 */
var bkExtend = function() {
	var args = arguments;
	if (args.length == 1)
		args = [this, args[0]];
	for (var prop in args[1])
		args[0][prop] = args[1][prop];
	return args[0];
};
function bkClass() {
}
bkClass.prototype.construct = function() {
};
bkClass.extend = function(def) {
	var classDef = function() {
		if (arguments[0] !== bkClass) {
			return this.construct.apply(this, arguments);
		}
	};
	var proto = new this(bkClass);
	bkExtend(proto, def);
	classDef.prototype = proto;
	classDef.extend = this.extend;
	return classDef;
};

var bkElement = bkClass.extend({
	construct: function(elm, d) {
		if (typeof(elm) == "string") {
			elm = (d || document).createElement(elm);
		}
		elm = $BK(elm);
		return elm;
	},
	appendTo: function(elm) {
		elm.appendChild(this);
		return this;
	},
	appendBefore: function(elm) {
		elm.parentNode.insertBefore(this, elm);
		return this;
	},
	addEvent: function(type, fn) {
		bkLib.addEvent(this, type, fn);
		return this;
	},
	setContent: function(c) {
		this.innerHTML = c;
		return this;
	},
	pos: function() {
		var curleft = curtop = 0;
		var o = obj = this;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		var b = (!window.opera) ? parseInt(this.getStyle('border-width') || this.style.border) || 0 : 0;
		return [curleft + b, curtop + b + this.offsetHeight];
	},
	noSelect: function() {
		bkLib.noSelect(this);
		return this;
	},
	parentTag: function(t) {
		var elm = this;
		do {
			if (elm && elm.nodeName && elm.nodeName.toUpperCase() == t) {
				return elm;
			}
			elm = elm.parentNode;
		} while (elm);
		return false;
	},
	hasClass: function(cls) {
		return this.className.match(new RegExp('(\\s|^)nicEdit-' + cls + '(\\s|$)'));
	},
	addClass: function(cls) {
		if (!this.hasClass(cls)) {
			this.className += " nicEdit-" + cls
		}
		;
		return this;
	},
	removeClass: function(cls) {
		if (this.hasClass(cls)) {
			this.className = this.className.replace(new RegExp('(\\s|^)nicEdit-' + cls + '(\\s|$)'), ' ');
		}
		return this;
	},
	setStyle: function(st) {
		var elmStyle = this.style;
		for (var itm in st) {
			switch (itm) {
				case 'float':
					elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm];
					break;
				case 'opacity':
					elmStyle.opacity = st[itm];
					elmStyle.filter = "alpha(opacity=" + Math.round(st[itm] * 100) + ")";
					break;
				case 'className':
					this.className = st[itm];
					break;
				default:
					//if(document.compatMode || itm != "cursor") { // Nasty Workaround for IE 5.5
					elmStyle[itm] = st[itm];
					//}    
			}
		}
		return this;
	},
	getStyle: function(cssRule, d) {
		var doc = (!d) ? document.defaultView : d;
		if (this.nodeType == 1)
			return (doc && doc.getComputedStyle) ? doc.getComputedStyle(this, null).getPropertyValue(cssRule) : this.currentStyle[ bkLib.camelize(cssRule) ];
	},
	remove: function() {
		this.parentNode.removeChild(this);
		return this;
	},
	setAttributes: function(at) {
		for (var itm in at) {
			switch (itm) {
				case 'style': // LP fix - object style can not to be as string
					if (at[itm])
						this[itm].cssText = at[itm];
					else
						this.removeAttribute(itm);
					break;
				case 'colspan': // LP fix
					this.colSpan = at[itm];
					if (at[itm] == 1)
						this.removeAttribute('colSpan');
					break;
				case 'rowspan': // LP fix
					this.rowSpan = at[itm];
					if (at[itm] == 1)
						this.removeAttribute('rowSpan');
					break;
				case 'class': // LP fix - attr class is className
					this.className = at[itm];
					if (!at[itm])
						this.removeAttribute('class');
					break;
				case 'align': // LP fix - this attr can not have value `none`
				case 'vAlign': // LP fix -  this attr can not have value `none`
					if (at[itm] == 'none')
						at[itm] = '';
				default:
					if (at[itm])
						this[itm] = at[itm];
					else
						this.removeAttribute(itm);
			}
		}
		return this;
	}
});

var bkLib = {
	isMSIE: (navigator.appVersion.indexOf("MSIE") != -1),
	addEvent: function(obj, type, fn) {
		(obj.addEventListener) ? obj.addEventListener(type, fn, false) : obj.attachEvent("on" + type, fn);
	},
	toArray: function(iterable) {
		var length = iterable.length, results = new Array(length);
		while (length--) {
			results[length] = iterable[length]
		}
		;
		return results;
	},
	noSelect: function(element) {
		if (element.setAttribute && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea') {
			element.setAttribute('unselectable', 'on');
		}
		for (var i = 0; i < element.childNodes.length; i++) {
			bkLib.noSelect(element.childNodes[i]);
		}
	},
	camelize: function(s) {
		return s.replace(/\-(.)/g, function(m, l) {
			return l.toUpperCase()
		});
	},
	inArray: function(arr, item) {
		return (bkLib.search(arr, item) != null);
	},
	search: function(arr, itm) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == itm)
				return i;
		}
		return null;
	},
	cancelEvent: function(e) {
		e = e || window.event;
		if (e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	},
	domLoad: [],
	domLoaded: function() {
		if (arguments.callee.done)
			return;
		arguments.callee.done = true;
		for (i = 0; i < bkLib.domLoad.length; i++)
			bkLib.domLoad[i]();
	},
	onDomLoaded: function(fireThis) {
		this.domLoad.push(fireThis);
		document.write("<style>.nicEdit-main td, .nicEdit-main th { border: 1px dashed #AAAAAA; }</style>");
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", bkLib.domLoaded, null);
		} else if (bkLib.isMSIE) {
			document.write("<style>.nicEdit-main p { margin: 0; } }</style></style><scr" + "ipt id=__ie_onload defer " + ((location.protocol == "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\/scr" + "ipt>");
			$BK("__ie_onload").onreadystatechange = function() {
				if (this.readyState == "complete") {
					bkLib.domLoaded();
				}
			};
		}
		window.onload = bkLib.domLoaded;
	}
};

function $BK(elm) {
	if (typeof(elm) == "string") {
		elm = document.getElementById(elm);
	}
	return (elm && !elm.appendTo) ? bkExtend(elm, bkElement.prototype) : elm;
}

var bkEvent = {
	addEvent: function(evType, evFunc) {
		if (evFunc) {
			this.eventList = this.eventList || {};
			this.eventList[evType] = this.eventList[evType] || [];
			this.eventList[evType].push(evFunc);
		}
		return this;
	},
	fireEvent: function() {
		var args = bkLib.toArray(arguments), evType = args.shift();
		if (this.eventList && this.eventList[evType]) {
			for (var i = 0; i < this.eventList[evType].length; i++) {
				this.eventList[evType][i].apply(this, args);
			}
		}
	}
};

function __(s) {
	return s;
}

Function.prototype.closure = function() {
	var __method = this, args = bkLib.toArray(arguments), obj = args.shift();
	return function() {
		if (typeof(bkLib) != 'undefined') {
			return __method.apply(obj, args.concat(bkLib.toArray(arguments)));
		}
	};
}

Function.prototype.closureListener = function() {
	var __method = this, args = bkLib.toArray(arguments), object = args.shift();
	return function(e) {
		e = e || window.event;
		if (e.target) {
			var target = e.target;
		} else {
			var target = e.srcElement
		}
		;
		return __method.apply(object, [e, target].concat(args));
	};
}


/* START CONFIG */

var nicEditorConfig = bkClass.extend({
	buttons: {
		'bold': {name: __('Жирный'), command: 'Bold', tags: ['B', 'STRONG'], css: {'font-weight': 'bold'}, key: 'b'},
		'italic': {name: __('Курсив'), command: 'Italic', tags: ['EM', 'I'], css: {'font-style': 'italic'}, key: 'i'},
		'underline': {name: __('Подчеркнутый'), command: 'Underline', tags: ['U'], css: {'text-decoration': 'underline'}, key: 'u'},
		'left': {name: __('Выровнять текст по левому краю'), command: 'justifyleft', noActive: true},
		'center': {name: __('Выровнять текст по центру'), command: 'justifycenter', noActive: true},
		'right': {name: __('Выровнять текст по правому краю'), command: 'justifyright', noActive: true},
		'justify': {name: __('Выравнивание по ширине'), command: 'justifyfull', noActive: true},
		'ol': {name: __('Нумерованный список'), command: 'insertorderedlist', tags: ['OL']},
		'ul': {name: __('Маркированный список'), command: 'insertunorderedlist', tags: ['UL']},
		'subscript': {name: __('Подстрочный'), command: 'subscript', tags: ['SUB']},
		'superscript': {name: __('Надстрочный'), command: 'superscript', tags: ['SUP']},
		'strikethrough': {name: __('Зачеркнутый'), command: 'strikeThrough', css: {'text-decoration': 'line-through'}},
		'removeformat': {name: __('Убрать форматирование'), command: 'removeformat', noActive: true},
		'indent': {name: __('Увеличить отступ'), command: 'indent', noActive: true},
		'outdent': {name: __('Уменьшить отступ'), command: 'outdent', noActive: true},
		'hr': {name: __('Горизонтальная линия'), command: 'insertHorizontalRule', noActive: true}
	},
	iconsPath: 'nicEditorIcons.gif',
	buttonList: ['save', 'bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'imgsMgr', 'link', 'unlink', 'forecolor', 'bgcolor','table','row','col','rowBefore','rowAfter','deleteRow','colBefore','colAfter','deleteCol','splitCells','mergeCells'],
	iconList: {"xhtml": 1, "bgcolor": 2, "forecolor": 3, "bold": 4, "center": 5, "hr": 6, "indent": 7, "italic": 8, "justify": 9, "left": 10, "ol": 11, "outdent": 12, "removeformat": 13, "right": 14, "save": 25, "strikethrough": 16, "subscript": 17, "superscript": 18, "ul": 19, "underline": 20, "image": 21, "link": 22, "unlink": 23, "close": 24, "arrow": 26, "imgsMgr": 28, "folder": 29, "jpg": 30, "png": 31, "gif": 32, "bmp": 33, "table": 34, "row": 35, "col": 36, "rowBefore": 37, "rowAfter": 38, "deleteRow": 39, "colBefore": 40, "colAfter": 41, "deleteCol": 42, "splitCells": 43, "mergeCells": 44}

});
/* END CONFIG */


var nicEditors = {
	nicPlugins: [],
	editors: [],
	registerPlugin: function(plugin, options) {
		this.nicPlugins.push({p: plugin, o: options});
	},
	allTextAreas: function(nicOptions) {
		var textareas = document.getElementsByTagName("textarea");
		for (var i = 0; i < textareas.length; i++) {
			nicEditors.editors.push(new nicEditor(nicOptions).panelInstance(textareas[i]));
		}
		return nicEditors.editors;
	},
	findEditor: function(e) {
		var editors = nicEditors.editors;
		for (var i = 0; i < editors.length; i++) {
			if (editors[i].instanceById(e)) {
				return editors[i].instanceById(e);
			}
		}
	}
};


var nicEditor = bkClass.extend({
	construct: function(o) {
		this.options = new nicEditorConfig();
		bkExtend(this.options, o);
		this.nicInstances = new Array();
		this.loadedPlugins = new Array();

		var plugins = nicEditors.nicPlugins;
		for (var i = 0; i < plugins.length; i++) {
			this.loadedPlugins.push(new plugins[i].p(this, plugins[i].o));
		}
		nicEditors.editors.push(this);
		bkLib.addEvent(document.body, 'mousedown', this.selectCheck.closureListener(this));
	},
	panelInstance: function(e, o) {
		e = this.checkReplace($BK(e));
		var panelElm = new bkElement('DIV').setStyle({width: (parseInt(e.getStyle('width')) || e.clientWidth) + 'px'}).appendBefore(e);
		this.setPanel(panelElm);
		return this.addInstance(e, o);
	},
	checkReplace: function(e) {
		var r = nicEditors.findEditor(e);
		if (r) {
			r.removeInstance(e);
			r.removePanel();
		}
		return e;
	},
	addInstance: function(e, o) {
		e = this.checkReplace($BK(e));
		if (e.contentEditable || !!window.opera) {
			var newInstance = new nicEditorInstance(e, o, this);
		} else {
			var newInstance = new nicEditorIFrameInstance(e, o, this);
		}
		this.nicInstances.push(newInstance);
    if (typeof this.options.instance_callback === 'function')
      this.options.instance_callback();
		return this;
	},
	removeInstance: function(e) {
		e = $BK(e);
		var instances = this.nicInstances;
		for (var i = 0; i < instances.length; i++) {
			if (instances[i].e == e) {
				instances[i].remove();
				this.nicInstances.splice(i, 1);
			}
		}
	},
	removePanel: function(e) {
		if (this.nicPanel) {
			this.nicPanel.remove();
			this.nicPanel = null;
		}
	},
	instanceById: function(e) {
		e = $BK(e);
		var instances = this.nicInstances;
		for (var i = 0; i < instances.length; i++) {
			if (instances[i].e == e) {
				return instances[i];
			}
		}
	},
	setPanel: function(e) {
		this.nicPanel = new nicEditorPanel($BK(e), this.options, this);
		this.fireEvent('panel', this.nicPanel);
		return this;
	},
	nicCommand: function(cmd, args) {
		if (this.selectedInstance) {
			this.selectedInstance.nicCommand(cmd, args);
		}
	},
	getIcon: function(iconName, options) {
		var icon = this.options.iconList[iconName];
		var file = (options.iconFiles) ? options.iconFiles[iconName] : '';
		return {backgroundImage: "url('" + ((icon) ? this.options.iconsPath : file) + "')", backgroundPosition: ((icon) ? ((icon - 1) * -18) : 0) + 'px 0px'};
	},
	selectCheck: function(e, t) {
		var found = false;
		do {
			if (t.className && t.className.indexOf('nicEdit') != -1) {
				return false;
			}
		} while (t = t.parentNode);
		this.fireEvent('blur', this.selectedInstance, t);
		this.lastSelectedInstance = this.selectedInstance;
		this.selectedInstance = null;
		return false;
	}

});
nicEditor = nicEditor.extend(bkEvent);


var nicEditorInstance = bkClass.extend({
	isSelected: false,
	construct: function(e, options, nicEditor) {
		this.ne = nicEditor;
		this.elm = this.e = e;
		this.options = options || {};

		newX = parseInt(e.getStyle('width')) || e.clientWidth;
		newY = parseInt(e.getStyle('height')) || e.clientHeight;
		this.initialHeight = newY - 8;

		var isTextarea = (e.nodeName.toLowerCase() == "textarea");
		if (isTextarea || this.options.hasPanel) {
			var ie7s = (bkLib.isMSIE && !((typeof document.body.style.maxHeight != "undefined") && document.compatMode == "CSS1Compat"))
			var s = {width: newX + 'px', border: '1px solid #ccc', borderTop: 0, overflowY: 'auto', overflowX: 'hidden'};
			s[(ie7s) ? 'height' : 'maxHeight'] = (this.ne.options.maxHeight) ? this.ne.options.maxHeight + 'px' : null;
			this.editorContain = new bkElement('DIV').setStyle(s).appendBefore(e);
			var editorElm = new bkElement('DIV').setStyle({width: (newX - 8) + 'px', margin: '4px', minHeight: newY + 'px'}).addClass('main').appendTo(this.editorContain);

			e.setStyle({display: 'none'});

			editorElm.innerHTML = e.innerHTML;
			if (isTextarea) {
				editorElm.setContent(e.value);
				this.copyElm = e;
				var f = e.parentTag('FORM');
				if (f) {
					bkLib.addEvent(f, 'submit', this.saveContent.closure(this));
				}
			}
			editorElm.setStyle((ie7s) ? {height: newY + 'px'} : {overflow: 'hidden'});
			this.elm = editorElm;
		}
		this.ne.addEvent('blur', this.blur.closure(this));

		this.init();
		this.blur();
	},
	init: function() {
		this.elm.setAttribute('contentEditable', 'true');
		if (this.getContent() == "") {
			this.setContent('<br />');
		}
		this.instanceDoc = document.defaultView;
		this.elm.addEvent('mousedown', this.selected.closureListener(this)).addEvent('keypress', this.keyDown.closureListener(this)).addEvent('focus', this.selected.closure(this)).addEvent('blur', this.blur.closure(this)).addEvent('keyup', this.selected.closure(this));
		this.ne.fireEvent('add', this);
	},
	remove: function() {
		this.saveContent();
		if (this.copyElm || this.options.hasPanel) {
			this.editorContain.remove();
			this.e.setStyle({'display': 'block'});
			this.ne.removePanel();
		}
		this.disable();
		this.ne.fireEvent('remove', this);
	},
	disable: function() {
		this.elm.setAttribute('contentEditable', 'false');
	},
	getSel: function() {
		return (window.getSelection) ? window.getSelection() : document.selection;
	},
	getRng: function() {
		var s = this.getSel();
		if (!s || s.rangeCount === 0) {
			return;
		}
		return (s.rangeCount > 0) ? s.getRangeAt(0) : s.createRange();
	},
	selRng: function(rng, s) {
		if (window.getSelection) {
			s.removeAllRanges();
			s.addRange(rng);
		} else {
			rng.select();
		}
	},
	selElm: function() {
		var r = this.getRng();
		if (!r) {
			return;
		}
		if (r.startContainer) {
			var contain = r.startContainer;
			if (r.cloneContents().childNodes.length == 1) {
				for (var i = 0; i < contain.childNodes.length; i++) {
					var rng = contain.childNodes[i].ownerDocument.createRange();
					rng.selectNode(contain.childNodes[i]);
					if (r.compareBoundaryPoints(Range.START_TO_START, rng) != 1 &&
							r.compareBoundaryPoints(Range.END_TO_END, rng) != -1) {
						return $BK(contain.childNodes[i]);
					}
				}
			}
			return $BK(contain);
		} else {
			return $BK((this.getSel().type == "Control") ? r.item(0) : r.parentElement());
		}
	},
	saveRng: function() {
		this.savedRange = this.getRng();
		this.savedSel = this.getSel();
	},
	restoreRng: function() {
		if (this.savedRange) {
			this.selRng(this.savedRange, this.savedSel);
		}
	},
	keyDown: function(e, t) {
		if (e.ctrlKey) {
			this.ne.fireEvent('key', this, e);
		}
	},
	selected: function(e, t) {
		if (!t && !(t = this.selElm)) {
			t = this.selElm();
		}
		if (!e.ctrlKey) {
			var selInstance = this.ne.selectedInstance;
			if (selInstance != this) {
				if (selInstance) {
					this.ne.fireEvent('blur', selInstance, t);
				}
				this.ne.selectedInstance = this;
				this.ne.fireEvent('focus', selInstance, t);
			}
			this.ne.fireEvent('selected', selInstance, t);
			this.isFocused = true;
			this.elm.addClass('selected');
		}
		return false;
	},
	blur: function() {
		this.isFocused = false;
		this.elm.removeClass('selected');
	},
	saveContent: function() {
		if (this.copyElm || this.options.hasPanel) {
			this.ne.fireEvent('save', this);
			(this.copyElm) ? this.copyElm.value = this.getContent() : this.e.innerHTML = this.getContent();
		}
	},
	getElm: function() {
		return this.elm;
	},
	getContent: function() {
		this.content = this.getElm().innerHTML;
		this.ne.fireEvent('get', this);
		return this.content;
	},
	setContent: function(e) {
		this.content = e;
		this.ne.fireEvent('set', this);
		this.elm.innerHTML = this.content;
	},
	nicCommand: function(cmd, args) {
		document.execCommand(cmd, false, args);
	}
});

var nicEditorIFrameInstance = nicEditorInstance.extend({
	savedStyles: [],
	init: function() {
		var c = this.elm.innerHTML.replace(/^\s+|\s+$/g, '');
		this.elm.innerHTML = '';
		(!c) ? c = "<br />" : c;
		this.initialContent = c;

		this.elmFrame = new bkElement('iframe').setAttributes({'src': 'javascript:;', 'frameBorder': 0, 'allowTransparency': 'true', 'scrolling': 'no'}).setStyle({height: '100px', width: '100%'}).addClass('frame').appendTo(this.elm);

		if (this.copyElm) {
			this.elmFrame.setStyle({width: (this.elm.offsetWidth - 4) + 'px'});
		}

		var styleList = ['font-size', 'font-family', 'font-weight', 'color'];
		for (itm in styleList) {
			this.savedStyles[bkLib.camelize(itm)] = this.elm.getStyle(itm);
		}

		setTimeout(this.initFrame.closure(this), 50);
	},
	disable: function() {
		this.elm.innerHTML = this.getContent();
	},
	initFrame: function() {
		var fd = $BK(this.elmFrame.contentWindow.document);
		fd.designMode = "on";
		fd.open();
		var css = this.ne.options.externalCSS;
		fd.write('<html><head>' + ((css) ? '<link href="' + css + '" rel="stylesheet" type="text/css" />' : '') + '</head><body id="nicEditContent" style="margin: 0 !important; background-color: transparent !important;">' + this.initialContent + '</body></html>');
		fd.close();
		this.frameDoc = fd;

		this.frameWin = $BK(this.elmFrame.contentWindow);
		this.frameContent = $BK(this.frameWin.document.body).setStyle(this.savedStyles);
		this.instanceDoc = this.frameWin.document.defaultView;

		this.heightUpdate();
		this.frameDoc.addEvent('mousedown', this.selected.closureListener(this)).addEvent('keyup', this.heightUpdate.closureListener(this)).addEvent('keydown', this.keyDown.closureListener(this)).addEvent('keyup', this.selected.closure(this));
		this.ne.fireEvent('add', this);
	},
	getElm: function() {
		return this.frameContent;
	},
	setContent: function(c) {
		this.content = c;
		this.ne.fireEvent('set', this);
		this.frameContent.innerHTML = this.content;
		this.heightUpdate();
	},
	getSel: function() {
		return (this.frameWin) ? this.frameWin.getSelection() : this.frameDoc.selection;
	},
	heightUpdate: function() {
		this.elmFrame.style.height = Math.max(this.frameContent.offsetHeight, this.initialHeight) + 'px';
	},
	nicCommand: function(cmd, args) {
		this.frameDoc.execCommand(cmd, false, args);
		setTimeout(this.heightUpdate.closure(this), 100);
	}


});
var nicEditorPanel = bkClass.extend({
	construct: function(e, options, nicEditor) {
		this.elm = e;
		this.options = options;
		this.ne = nicEditor;
		this.panelButtons = new Array();
		this.buttonList = bkExtend([], this.ne.options.buttonList);

		this.panelContain = new bkElement('DIV').setStyle({overflow: 'hidden', width: '100%', border: '1px solid #cccccc', backgroundColor: '#efefef'}).addClass('panelContain');
		this.panelElm = new bkElement('DIV').setStyle({margin: '2px', marginTop: '0px', zoom: 1, overflow: 'hidden'}).addClass('panel').appendTo(this.panelContain);
		this.panelContain.appendTo(e);

		var opt = this.ne.options;
		var buttons = opt.buttons;
		for (button in buttons) {
			this.addButton(button, opt, true);
		}
		this.reorder();
		e.noSelect();
	},
	addButton: function(buttonName, options, noOrder) {
		var button = options.buttons[buttonName];
		var type = (button['type']) ? eval('(typeof(' + button['type'] + ') == "undefined") ? null : ' + button['type'] + ';') : nicEditorButton;
		var hasButton = bkLib.inArray(this.buttonList, buttonName);
		if (type && (hasButton || this.ne.options.fullPanel)) {
			this.panelButtons.push(new type(this.panelElm, buttonName, options, this.ne));
			if (!hasButton) {
				this.buttonList.push(buttonName);
			}
		}
	},
	findButton: function(itm) {
		for (var i = 0; i < this.panelButtons.length; i++) {
			if (this.panelButtons[i].name == itm)
				return this.panelButtons[i];
		}
	},
	reorder: function() {
		var bl = this.buttonList;
		for (var i = 0; i < bl.length; i++) {
			var button = this.findButton(bl[i]);
			if (button) {
				this.panelElm.appendChild(button.margin);
			}
		}
	},
	remove: function() {
		this.elm.remove();
	}
});
var nicEditorButton = bkClass.extend({
	construct: function(e, buttonName, options, nicEditor) {
		this.options = options.buttons[buttonName];
		this.name = buttonName;
		this.ne = nicEditor;
		this.elm = e;

		this.margin = new bkElement('DIV').setStyle({'float': 'left', marginTop: '2px'}).appendTo(e);
		this.contain = new bkElement('DIV').setStyle({width: '20px', height: '20px'}).addClass('buttonContain').appendTo(this.margin);
		this.border = new bkElement('DIV').setStyle({backgroundColor: '#efefef', border: '1px solid #efefef'}).appendTo(this.contain);
		this.button = new bkElement('DIV').setStyle({width: '18px', height: '18px', overflow: 'hidden', zoom: 1, cursor: 'pointer'}).addClass('button').setStyle(this.ne.getIcon(buttonName, options)).appendTo(this.border);
		this.button.addEvent('mouseover', this.hoverOn.closure(this)).addEvent('mouseout', this.hoverOff.closure(this)).addEvent('mousedown', this.mouseClick.closure(this)).noSelect();

		if (!window.opera) {
			this.button.onmousedown = this.button.onclick = bkLib.cancelEvent;
		}

		nicEditor.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this)).addEvent('key', this.key.closure(this));

		this.disable();
		this.init();
	},
	init: function() {
	},
	hide: function() {
		this.contain.setStyle({display: 'none'});
	},
	updateState: function() {
		if (this.isDisabled) {
			this.setBg();
		}
		else if (this.isHover) {
			this.setBg('hover');
		}
		else if (this.isActive) {
			this.setBg('active');
		}
		else {
			this.setBg();
		}
	},
	setBg: function(state) {
		switch (state) {
			case 'hover':
				var stateStyle = {border: '1px solid #666', backgroundColor: '#ddd'};
				break;
			case 'active':
				var stateStyle = {border: '1px solid #666', backgroundColor: '#ccc'};
				break;
			default:
				var stateStyle = {border: '1px solid #efefef', backgroundColor: '#efefef'};
		}
		this.border.setStyle(stateStyle).addClass('button-' + state);
	},
	checkNodes: function(e) {
		var elm = e;
		do {
			if (this.options.tags && bkLib.inArray(this.options.tags, elm.nodeName)) {
				this.activate();
				return true;
			}
		} while (elm = elm.parentNode && elm.className != "nicEdit");
		elm = $BK(e);
		while (elm.nodeType == 3) {
			elm = $BK(elm.parentNode);
		}
		if (this.options.css) {
			for (itm in this.options.css) {
				if (elm.getStyle(itm, this.ne.selectedInstance.instanceDoc) == this.options.css[itm]) {
					this.activate();
					return true;
				}
			}
		}
		this.deactivate();
		return false;
	},
	activate: function() {
		if (!this.isDisabled) {
			this.isActive = true;
			this.updateState();
			this.ne.fireEvent('buttonActivate', this);
		}
	},
	deactivate: function() {
		this.isActive = false;
		this.updateState();
		if (!this.isDisabled) {
			this.ne.fireEvent('buttonDeactivate', this);
		}
	},
	enable: function(ins, t) {
		this.isDisabled = false;
		this.contain.setStyle({'opacity': 1}).addClass('buttonEnabled');
		this.updateState();
		this.checkNodes(t);
	},
	disable: function(ins, t) {
		this.isDisabled = true;
		this.contain.setStyle({'opacity': 0.6}).removeClass('buttonEnabled');
		this.updateState();
	},
	toggleActive: function() {
		(this.isActive) ? this.deactivate() : this.activate();
	},
	hoverOn: function() {
		if (!this.isDisabled) {
			this.isHover = true;
			this.updateState();
			this.ne.fireEvent("buttonOver", this);
		}
	},
	hoverOff: function() {
		this.isHover = false;
		this.updateState();
		this.ne.fireEvent("buttonOut", this);
	},
	mouseClick: function() {
		if (this.options.command) {
			this.ne.nicCommand(this.options.command, this.options.commandArgs);
			if (!this.options.noActive) {
				this.toggleActive();
			}
		}
		this.ne.fireEvent("buttonClick", this);
	},
	key: function(nicInstance, e) {
		if (this.options.key && e.ctrlKey && String.fromCharCode(e.keyCode || e.charCode).toLowerCase() == this.options.key) {
			this.mouseClick();
			if (e.preventDefault)
				e.preventDefault();
		}
	}

});


var nicPlugin = bkClass.extend({
	construct: function(nicEditor, options) {
		this.options = options;
		this.ne = nicEditor;
		this.ne.addEvent('panel', this.loadPanel.closure(this));

		this.init();
	},
	loadPanel: function(np) {
		var buttons = this.options.buttons;
		for (var button in buttons) {
			np.addButton(button, this.options);
		}
		np.reorder();
	},
	init: function() {
	}
});




/* START CONFIG */
var nicPaneOptions = {};
/* END CONFIG */

var nicEditorPane = bkClass.extend({
	construct: function(elm, nicEditor, options, openButton) {
		this.ne = nicEditor;
		this.elm = elm;
		this.pos = elm.pos();

		this.contain = new bkElement('div').setStyle({zIndex: '99999', overflow: 'hidden', position: 'absolute', left: this.pos[0] + 'px', top: this.pos[1] + 'px'})
		this.pane = new bkElement('div').setStyle({fontSize: '12px', border: '1px solid #ccc', 'overflow': 'hidden', padding: '4px', textAlign: 'left', backgroundColor: '#ffffc9'}).addClass('pane').setStyle(options).appendTo(this.contain);

		if (openButton && !openButton.options.noClose) {
			this.close = new bkElement('div').setStyle({'float': 'right', height: '16px', width: '16px', cursor: 'pointer'}).setStyle(this.ne.getIcon('close', nicPaneOptions)).addEvent('mousedown', openButton.removePane.closure(this)).appendTo(this.pane);
		}

		this.contain.noSelect().appendTo(document.body);

		this.position();
		this.init();
	},
	init: function() {
	},
	position: function() {
		if (this.ne.nicPanel) {
			var panelElm = this.ne.nicPanel.elm;
			var panelPos = panelElm.pos();
			var newLeft = panelPos[0] + parseInt(panelElm.getStyle('width')) - (parseInt(this.pane.getStyle('width')) + 8);
			if (newLeft < this.pos[0]) {
				this.contain.setStyle({left: newLeft + 'px'});
			}
		}
	},
	toggle: function() {
		this.isVisible = !this.isVisible;
		this.contain.setStyle({display: ((this.isVisible) ? 'block' : 'none')});
	},
	remove: function() {
		if (this.contain) {
			this.contain.remove();
			this.contain = null;
		}
	},
	append: function(c) {
		c.appendTo(this.pane);
	},
	setContent: function(c) {
		this.pane.setContent(c);
	}

});



var nicEditorAdvancedButton = nicEditorButton.extend({
	init: function() {
		this.ne.addEvent('selected', this.removePane.closure(this)).addEvent('blur', this.removePane.closure(this));
	},
	mouseClick: function() {
		if (!this.isDisabled) {
			if (this.pane && this.pane.pane) {
				this.removePane();
			} else {
				this.pane = new nicEditorPane(this.contain, this.ne, {width: (this.width || '270px'), backgroundColor: '#fff'}, this);
				this.addPane();
				this.ne.selectedInstance.saveRng();
			}
		}
	},
	addForm: function(f, elm) {
		this.form = new bkElement('form').addEvent('submit', this.submit.closureListener(this));
		this.pane.append(this.form);
		this.inputs = {};

		for (itm in f) {
			var field = f[itm];
			var val = '';
			if (elm) {
				switch (itm) {
					case 'style': // LP fix - because style of the element is an object (this is not string)
						val = elm.style.cssText.toLowerCase() || '';
						break;
					case 'class': // LP fix
						val = elm.className || '';
						break;
					default:
						val = elm.getAttribute(itm) || '';
				}
			}
			if (!val) {
				val = field['value'] || '';
			}
			var type = f[itm].type;

			if (type == 'title') {
				new bkElement('div').setContent(field.txt).setStyle({fontSize: '14px', fontWeight: 'bold', padding: '0px', margin: '2px 0'}).appendTo(this.form);
			} else if (type == 'hidden') {
				// nothing
			} else {
				var contain = new bkElement('div').setStyle({overflow: 'hidden', clear: 'both'}).appendTo(this.form);
				if (field.txt) {
					new bkElement('label').setAttributes({'for': itm}).setContent(field.txt).setStyle({margin: '2px 4px', fontSize: '13px', width: '100px', lineHeight: '20px', textAlign: 'right', 'float': 'left'}).appendTo(contain);
				}

				switch (type) {
					case 'text':
						this.inputs[itm] = new bkElement('input').setAttributes({id: itm, 'value': val, 'type': 'text'}).setStyle({margin: '2px 0', fontSize: '13px', 'float': 'left', height: '20px', border: '1px solid #ccc', overflow: 'hidden'}).setStyle(field.style).appendTo(contain);
						break;
					case 'select':
						this.inputs[itm] = new bkElement('select').setAttributes({id: itm}).setStyle({border: '1px solid #ccc', 'float': 'left', margin: '2px 0'}).appendTo(contain);
						for (opt in field.options) {
							var o = new bkElement('option').setAttributes({value: opt, selected: (opt == val) ? 'selected' : ''}).setContent(field.options[opt]).appendTo(this.inputs[itm]);
						}
						break;
					case 'content':
						this.inputs[itm] = new bkElement('textarea').setAttributes({id: itm}).setStyle({border: '1px solid #ccc', 'float': 'left'}).setStyle(field.style).appendTo(contain);
						this.inputs[itm].value = val;
				}
			}
		}
		new bkElement('input').setAttributes({'type': 'submit'}).setStyle({backgroundColor: '#efefef', border: '1px solid #ccc', margin: '3px 0', 'float': 'left', 'clear': 'both'}).appendTo(this.form);
		this.form.onsubmit = bkLib.cancelEvent;
	},
	submit: function() {
	},
	findElm: function(tag, attr, val) {
		var list = this.ne.selectedInstance.getElm().getElementsByTagName(tag);
		for (var i = 0; i < list.length; i++) {
			if (list[i].getAttribute(attr) == val) {
				return $BK(list[i]);
			}
		}
	},
	removePane: function() {
		if (this.pane) {
			this.pane.remove();
			this.pane = null;
			this.ne.selectedInstance.restoreRng();
		}
	}
});


var nicButtonTips = bkClass.extend({
	construct: function(nicEditor) {
		this.ne = nicEditor;
		nicEditor.addEvent('buttonOver', this.show.closure(this)).addEvent('buttonOut', this.hide.closure(this));

	},
	show: function(button) {
		this.timer = setTimeout(this.create.closure(this, button), 400);
	},
	create: function(button) {
		this.timer = null;
		if (!this.pane) {
			this.pane = new nicEditorPane(button.button, this.ne, {fontSize: '12px', marginTop: '5px'});
			this.pane.setContent(button.options.name);
		}
	},
	hide: function(button) {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		if (this.pane) {
			this.pane = this.pane.remove();
		}
	}
});
nicEditors.registerPlugin(nicButtonTips);



/* START CONFIG */
var nicSelectOptions = {
	buttons: {
		'fontSize': {name: __('Выбрать размер шрифта'), type: 'nicEditorFontSizeSelect', command: 'fontsize'},
		'fontFamily': {name: __('Выбрать шрифт'), type: 'nicEditorFontFamilySelect', command: 'fontname'},
		'fontFormat': {name: __('Выбрать стиль'), type: 'nicEditorFontFormatSelect', command: 'formatBlock'}
	}
};
/* END CONFIG */
var nicEditorSelect = bkClass.extend({
	construct: function(e, buttonName, options, nicEditor) {
		this.options = options.buttons[buttonName];
		this.elm = e;
		this.ne = nicEditor;
		this.name = buttonName;
		this.selOptions = new Array();

		this.margin = new bkElement('div').setStyle({'float': 'left', margin: '2px 1px 0 1px'}).appendTo(this.elm);
		this.contain = new bkElement('div').setStyle({width: '90px', height: '20px', cursor: 'pointer', overflow: 'hidden'}).addClass('selectContain').addEvent('click', this.toggle.closure(this)).appendTo(this.margin);
		this.items = new bkElement('div').setStyle({overflow: 'hidden', zoom: 1, border: '1px solid #ccc', paddingLeft: '3px', backgroundColor: '#fff'}).appendTo(this.contain);
		this.control = new bkElement('div').setStyle({overflow: 'hidden', 'float': 'right', height: '18px', width: '16px'}).addClass('selectControl').setStyle(this.ne.getIcon('arrow', options)).appendTo(this.items);
		this.txt = new bkElement('div').setStyle({overflow: 'hidden', 'float': 'left', width: '66px', height: '14px', marginTop: '1px', fontFamily: 'sans-serif', textAlign: 'center', fontSize: '12px'}).addClass('selectTxt').appendTo(this.items);

		if (!window.opera) {
			this.contain.onmousedown = this.control.onmousedown = this.txt.onmousedown = bkLib.cancelEvent;
		}

		this.margin.noSelect();

		this.ne.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this));

		this.disable();
		this.init();
	},
	disable: function() {
		this.isDisabled = true;
		this.close();
		this.contain.setStyle({opacity: 0.6});
	},
	enable: function(t) {
		this.isDisabled = false;
		this.close();
		this.contain.setStyle({opacity: 1});
	},
	setDisplay: function(txt) {
		this.txt.setContent(txt);
	},
	toggle: function() {
		if (!this.isDisabled) {
			(this.pane) ? this.close() : this.open();
		}
	},
	open: function() {
		this.pane = new nicEditorPane(this.items, this.ne, {width: '88px', padding: '0px', borderTop: 0, borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', borderBottom: '0px', backgroundColor: '#fff'});

		for (var i = 0; i < this.selOptions.length; i++) {
			var opt = this.selOptions[i];
			var itmContain = new bkElement('div').setStyle({overflow: 'hidden', borderBottom: '1px solid #ccc', width: '88px', textAlign: 'left', overflow : 'hidden', cursor: 'pointer'});
			var itm = new bkElement('div').setStyle({padding: '0px 4px'}).setContent(opt[1]).appendTo(itmContain).noSelect();
			itm.addEvent('click', this.update.closure(this, opt[0])).addEvent('mouseover', this.over.closure(this, itm)).addEvent('mouseout', this.out.closure(this, itm)).setAttributes('id', opt[0]);
			this.pane.append(itmContain);
			if (!window.opera) {
				itm.onmousedown = bkLib.cancelEvent;
			}
		}
	},
	close: function() {
		if (this.pane) {
			this.pane = this.pane.remove();
		}
	},
	over: function(opt) {
		opt.setStyle({backgroundColor: '#ccc'});
	},
	out: function(opt) {
		opt.setStyle({backgroundColor: '#fff'});
	},
	add: function(k, v) {
		this.selOptions.push(new Array(k, v));
	},
	update: function(elm) {
		this.ne.nicCommand(this.options.command, elm);
		this.close();
	}
});

var nicEditorFontSizeSelect = nicEditorSelect.extend({
	sel: {1: '1&nbsp;(8pt)', 2: '2&nbsp;(10pt)', 3: '3&nbsp;(12pt)', 4: '4&nbsp;(14pt)', 5: '5&nbsp;(18pt)', 6: '6&nbsp;(24pt)'},
	init: function() {
		this.setDisplay('Размер&nbsp;шрифта...');
		for (itm in this.sel) {
			this.add(itm, '<font size="' + itm + '">' + this.sel[itm] + '</font>');
		}
	}
});

var nicEditorFontFamilySelect = nicEditorSelect.extend({
	sel: {'arial': 'Arial', 'comic sans ms': 'Comic Sans', 'courier new': 'Courier New', 'georgia': 'Georgia', 'helvetica': 'Helvetica', 'impact': 'Impact', 'times new roman': 'Times', 'trebuchet ms': 'Trebuchet', 'verdana': 'Verdana'},
	init: function() {
		this.setDisplay('Шрифт...');
		for (itm in this.sel) {
			this.add(itm, '<font face="' + itm + '">' + this.sel[itm] + '</font>');
		}
	}
});

var nicEditorFontFormatSelect = nicEditorSelect.extend({
	sel: {'p': 'Параграф', 'pre': 'Pre', 'h6': 'Заголовок&nbsp;6', 'h5': 'Заголовок&nbsp;5', 'h4': 'Заголовок&nbsp;4', 'h3': 'Заголовок&nbsp;3', 'h2': 'Заголовок&nbsp;2', 'h1': 'Заголовок&nbsp;1'},
	init: function() {
		this.setDisplay('Стиль...');
		for (itm in this.sel) {
			var tag = itm.toUpperCase();
			this.add('<' + tag + '>', '<' + itm + ' style="padding: 0px; margin: 0px;">' + this.sel[itm] + '</' + tag + '>');
		}
	}
});

nicEditors.registerPlugin(nicPlugin, nicSelectOptions);



/* START CONFIG */
var nicLinkOptions = {
	buttons: {
		'link': {name: 'Добавить ссылку', type: 'nicLinkButton', tags: ['A']},
		'unlink': {name: 'Удалить ссылку', command: 'unlink', noActive: true}
	}
};
/* END CONFIG */

var nicLinkButton = nicEditorAdvancedButton.extend({
	addPane: function() {
		this.ln = this.ne.selectedInstance.selElm().parentTag('A');
		this.addForm({
			'': {type: 'title', txt: 'Добавить/изменить ссылку'},
			'href': {type: 'text', txt: 'URL', value: 'http://', style: {width: '150px'}},
			'title': {type: 'text', txt: 'Тайтл'},
			'target': {type: 'select', txt: 'Открыть в', options: {'': 'Текущем окне', '_blank': 'Новом окне'}, style: {width: '100px'}}
		}, this.ln);
	},
	submit: function(e) {
		var url = this.inputs['href'].value;
		if (url == "http://" || url == "") {
			alert("Вы должны указать URL, что бы создать ссылку");
			return false;
		}
		this.removePane();

		if (!this.ln) {
			var tmp = 'javascript:nicTemp();';
			this.ne.nicCommand("createlink", tmp);
			this.ln = this.findElm('A', 'href', tmp);
		}
		if (this.ln) {
			this.ln.setAttributes({
				href: this.inputs['href'].value,
				title: this.inputs['title'].value,
				target: this.inputs['target'].options[this.inputs['target'].selectedIndex].value
			});
		}
	}
});

nicEditors.registerPlugin(nicPlugin, nicLinkOptions);



/* START CONFIG */
var nicColorOptions = {
	buttons: {
		'forecolor': {name: __('Изменить цвет текста'), type: 'nicEditorColorButton', noClose: true},
		'bgcolor': {name: __('Изменить цвет фона'), type: 'nicEditorBgColorButton', noClose: true}
	}
};
/* END CONFIG */

var nicEditorColorButton = nicEditorAdvancedButton.extend({
	addPane: function() {
		var colorList = ['ef001b', 'cc0017', 'a60012', '83000e', '5c000a', 'ef0078', 'ce0067', 'ad0057', '8b0045', '6a0035', 'e301ed', 'c501ce', 'a401ab', '88018e', '610066', '6716ef', '5913ce', '4b10af', '3e0d90', '2d0a6a', 'f13449', 'd52437', 'bb1d2e', '980b1a', '70000c', 'f32a8f', 'd5207a', 'b21162', '970c51', '710039', 'e624ef', 'cc20d4', 'ad10b4', '900995', '6f0374', '7b38ed', '6c2fd2', '5c27b5', '471a94', '391379', 'f67684', 'e36875', 'ca5965', 'b34e59', '933c45', 'f563ac', 'de599b', 'cc5490', 'b24d7f', '96416c', 'ee68f4', 'db5fe1', 'c759cc', 'b255b6', '964799', 'a779f5', '976cdf', '8d68cc', '7f5eb7', '6f539c', 'fcc0c6', 'eea8af', 'dd959c', 'ce8c93', 'bc858b', 'fec7e2', 'f4b8d6', 'e5a6c6', 'd495b4', 'bb85a0', 'fabffd', 'eeaff1', 'e19fe4', 'cf90d2', 'b985bb', 'e0c3fd', 'd1b1f1', 'c1a0e2', 'b192d1', 'a489c0', 'fef5f6', 'fdeced', 'f7dee0', 'eacedc', 'dec1d0', 'fef3f8', 'fbe8f1', 'efd0e0', 'e6c7d6', 'd9b8c8', 'fef2fe', 'fae6fb', 'f1d3f2', 'e3c1e4', 'd8bad9', 'f5edfe', 'f0e5fb', 'e1d3ef', 'd9cbe7', 'cdbfdc', '028b6c', '02775d', '02644e', '015441', '013b2e', '1882ed', '1574d4', '115eab', '0e4f90', '0a3764', '0040eb', '0039d0', '0030b1', '002892', '001b64', '50509e', '46468b', '3a3a73', '303060', '222245', '279980', '1c856e', '15705b', '0b5b49', '054637', '3c95ee', '3283d5', '286fb8', '1b5997', '0c3e71', '2a61f3', '1d4ed3', '1640b2', '113699', '022072', '6d6db0', '5d5d99', '4c4c82', '373763', '29294d', '69baa7', '61a898', '57998a', '508b7d', '47776c', '7bb8f5', '6ea7e0', '6195c9', '5684b2', '4c7298', '6d92f5', '5f82e0', '5675c9', '4d68b2', '495f9a', '9b9bc9', '8b8bb6', '7e7ea5', '747496', '5f5f7a', 'd0eae4', 'b3d7cf', '9bc4ba', '8fb4ac', '86a49d', 'c3dffc', 'aacdf0', '9bbde0', '97b4d1', '94acc4', 'bdcdfb', 'a8bbef', '96aae1', '8a9bcb', '8393c0', 'd8d8eb', 'c7c7dc', 'b5b5cc', 'a5a5bc', '9898ac', 'f0f8f6', 'deedea', 'd7e6e2', 'ceddda', 'c8d6d2', 'f1f7fe', 'e5f0fb', 'd8e5f2', 'cfdbe7', 'c3cfda', 'eff3fe', 'e5eafa', 'dde3f4', 'd2d8ea', 'c3cadd', 'f4f4f9', 'e5e5ef', 'dbdbe5', 'd6d6df', 'd1d1d9', '00a000', '008d00', '007700', '006000', '004500', '86d800', '73ba00', '629e00', '528400', '395c00', 'eded00', 'cece00', 'afaf00', '909000', '737300', 'e3ab00', 'c79600', 'aa8000', '856400', '604800', '27b127', '229c22', '1b881b', '0f6e0f', '085408', '96dc24', '84c220', '6ea515', '5c8b0f', '3f6600', 'f1f12c', 'd3d31b', 'b2b211', '959509', '747403', 'e8b827', 'cda220', 'b18a15', '8c6c0a', '6e5300', '68c868', '5cb65c', '56a456', '4b924b', '488248', 'b7e768', 'a8d45f', '97c056', '86aa4d', '718e41', 'f1f164', 'e1e15d', 'caca58', 'b2b24d', '979746', 'eecc65', 'dabc5e', 'c7ac59', 'b09850', '948044', 'c6ecc6', 'addead', '96cd96', '87b987', '87b087', 'e1f6c0', 'd0eba6', 'c1d99a', 'b1c88c', 'a4b786', 'fbfbad', 'f1f194', 'e2e28e', 'cece8c', 'b9b982', 'faeaba', 'f2dfa7', 'e6d090', 'cbbb8b', 'b6a778', 'eef9ee', 'dff1df', 'd5e8d5', 'c6dbc6', 'bed1be', 'f1fbe2', 'e9f5d5', 'dfebcd', 'd4e1c0', 'c9d5b6', 'fefef0', 'fafae3', 'f0f0cb', 'e4e4c5', 'dadaba', 'fdf8ea', 'f9f2de', 'eee4c7', 'dfd7bf', 'd6cfb7', '818181', '676767', '494949', '272727', '000000', '783c00', '673300', '562b00', '472300', '341a00', 'eb4600', 'cd3d00', 'ad3300', '8f2a00', '671e00', 'ed7700', 'd26900', 'af5800', '904800', '643200', '989898', '838383', '646464', '515151', '2f2f2f', '8c5927', '7c4f23', '673f19', '583616', '402408', 'eb5f26', 'd1521e', 'b34315', '95330a', '702303', 'f08c28', 'd47a20', 'b96816', '954f09', '713902', 'c9c9c9', 'a9a9a9', '919191', '787878', '565656', 'af8b68', 'a28264', '917458', '856d55', '715c49', 'f19068', 'dd8561', 'c97654', 'b47053', '985d45', 'f5ac63', 'e1a05f', 'ca9259', 'b78451', '966b41', 'efefef', 'dcdcdc', 'c1c1c1', '9d9d9d', '828282', 'dbcab9', 'ccb8a5', 'bda792', 'a3917f', '9a8979', 'fbcebc', 'f1bba5', 'e1aa93', 'ce9f8b', 'b18b7b', 'fcd7b3', 'f3caa2', 'e7b98c', 'c8a078', 'b29171', 'ffffff', 'f7f7f7', 'ededed', 'dddddd', 'c9c9c9', 'f4efeb', 'efe8e1', 'e6ded6', 'dbd3cc', 'd0c9c2', 'fef5f2', 'fae8e1', 'f0dbd3', 'e1cbc2', 'd6beb5', 'fef7f0', 'faecde', 'f1e2d3', 'e3d3c3', 'dacaba'];
		var colorItems = new bkElement('DIV').setStyle({width: '270px'});
		for (var color in colorList) {
			var colorCode = '#' + colorList[color];
			var colorSquare = new bkElement('DIV').setStyle({'cursor': 'pointer', 'height': '15px', 'float': 'left'}).appendTo(colorItems);
			var colorBorder = new bkElement('DIV').setStyle({border: '2px solid ' + colorCode}).appendTo(colorSquare);
			var colorInner = new bkElement('DIV').setStyle({backgroundColor: colorCode, overflow: 'hidden', width: '9px', height: '12px'}).addEvent('click', this.colorSelect.closure(this, colorCode)).addEvent('mouseover', this.on.closure(this, colorBorder)).addEvent('mouseout', this.off.closure(this, colorBorder, colorCode)).appendTo(colorBorder);
			colorInner.setAttribute('title', colorCode);
			if (!window.opera) {
				colorSquare.onmousedown = colorInner.onmousedown = bkLib.cancelEvent;
			}
		}
		this.pane.append(colorItems.noSelect());
	},
	colorSelect: function(c) {
		this.ne.nicCommand('foreColor', c);
		this.removePane();
	},
	on: function(colorBorder) {
		colorBorder.setStyle({border: '2px solid #000'});
	},
	off: function(colorBorder, colorCode) {
		colorBorder.setStyle({border: '2px solid ' + colorCode});
	}
});

var nicEditorBgColorButton = nicEditorColorButton.extend({
	colorSelect: function(c) {
		this.ne.nicCommand('hiliteColor', c);
		this.removePane();
	}
});

nicEditors.registerPlugin(nicPlugin, nicColorOptions);



/* START CONFIG */
var nicImageOptions = {
	buttons: {
		'image': {name: 'Добавить изображение', type: 'nicImageButton', tags: ['IMG']}
	}

};
/* END CONFIG */

var nicImageButton = nicEditorAdvancedButton.extend({
	addPane: function() {
		this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
		this.addForm({
			'': {type: 'title', txt: 'Добавить/изменить изображение'},
			'src': {type: 'text', txt: 'URL', 'value': 'http://', style: {width: '150px'}},
			'alt': {type: 'text', txt: 'Alt текст', style: {width: '100px'}},
			'align': {type: 'select', txt: 'Выравн.', options: {none: 'По умолчанию', 'left': 'Слева', 'right': 'Справа'}},
			'width': {type: 'text', txt: 'Ширина', style: {width: '40px'}},
			'height': {type: 'text', txt: 'Высота', style: {width: '40px'}},
			'vspace': {type: 'text', txt: 'Вертик. отступ', style: {width: '40px'}},
			'hspace': {type: 'text', txt: 'Горизонт. отступ', style: {width: '40px'}},
			'class': {type: 'text', txt: 'Класс', style: {width: '150px'}},
			'style': {type: 'text', txt: 'CSS стиль', style: {width: '150px'}}
		}, this.im);
	},
	submit: function(e) {
		var src = this.inputs['src'].value;
		if (src == "" || src == "http://") {
			alert("Вы должны указать URL что бы вставить изображение");
			return false;
		}
		this.removePane();

		if (!this.im) {
			var tmp = 'javascript:nicImTemp();';
			this.ne.nicCommand("insertImage", tmp);
			this.im = this.findElm('IMG', 'src', tmp);
		}
		if (this.im) {
			this.im.setAttributes({
				src: this.inputs['src'].value,
				alt: this.inputs['alt'].value,
				align: this.inputs['align'].value,
				width: parseInt(this.inputs['width'].value),
				height: parseInt(this.inputs['height'].value),
				vspace: parseInt(this.inputs['vspace'].value),
				hspace: parseInt(this.inputs['hspace'].value),
				'class': this.inputs['class'].value,
				style: this.inputs['style'].value
			});
		}
	}
});

nicEditors.registerPlugin(nicPlugin, nicImageOptions);




/* START CONFIG */
var nicSaveOptions = {
	buttons: {
		'save': {name: __('Сохранить контент'), type: 'nicEditorSaveButton'}
	}
};
/* END CONFIG */

var nicEditorSaveButton = nicEditorButton.extend({
	init: function() {
		if (!this.ne.options.onSave) {
			this.margin.setStyle({'display': 'none'});
		}
	},
	mouseClick: function() {
		var onSave = this.ne.options.onSave;
		var selectedInstance = this.ne.selectedInstance;
		onSave(selectedInstance.getContent(), selectedInstance.elm.id, selectedInstance);
	}
});

nicEditors.registerPlugin(nicPlugin, nicSaveOptions);



var nicXHTML = bkClass.extend({
	stripAttributes: ['_moz_dirty', '_moz_resizing', '_extended'],
	noShort: ['style', 'title', 'script', 'textarea', 'a'],
	cssReplace: {'font-weight:bold;': 'strong', 'font-style:italic;': 'em'},
	sizes: {1: 'xx-small', 2: 'x-small', 3: 'small', 4: 'medium', 5: 'large', 6: 'x-large'},
	construct: function(nicEditor) {
		this.ne = nicEditor;
		if (this.ne.options.xhtml) {
			nicEditor.addEvent('get', this.cleanup.closure(this));
		}
	},
	cleanup: function(ni) {
		var node = ni.getElm();
		var xhtml = this.toXHTML(node);
		ni.content = xhtml;
	},
	toXHTML: function(n, r, d) {
		var txt = '';
		var attrTxt = '';
		var cssTxt = '';
		var nType = n.nodeType;
		var nName = n.nodeName.toLowerCase();
		var nChild = n.hasChildNodes && n.hasChildNodes();
		var extraNodes = new Array();

		switch (nType) {
			case 1:
				var nAttributes = n.attributes;

				switch (nName) {
					case 'b':
						nName = 'strong';
						break;
					case 'i':
						nName = 'em';
						break;
					case 'font':
						nName = 'span';
						break;
				}

				if (r) {
					for (var i = 0; i < nAttributes.length; i++) {
						var attr = nAttributes[i];

						var attributeName = attr.nodeName.toLowerCase();
						var attributeValue = attr.nodeValue;

						if (!attr.specified || !attributeValue || bkLib.inArray(this.stripAttributes, attributeName) || typeof(attributeValue) == "function") {
							continue;
						}

						switch (attributeName) {
							case 'style':
								var css = attributeValue.replace(/ /g, "");
								for (itm in this.cssReplace) {
									if (css.indexOf(itm) != -1) {
										extraNodes.push(this.cssReplace[itm]);
										css = css.replace(itm, '');
									}
								}
								cssTxt += css;
								attributeValue = "";
								break;
							case 'class':
								attributeValue = attributeValue.replace("Apple-style-span", "");
								break;
							case 'size':
								cssTxt += "font-size:" + this.sizes[attributeValue] + ';';
								attributeValue = "";
								break;
						}

						if (attributeValue) {
							attrTxt += ' ' + attributeName + '="' + attributeValue + '"';
						}
					}

					if (cssTxt) {
						attrTxt += ' style="' + cssTxt + '"';
					}

					for (var i = 0; i < extraNodes.length; i++) {
						txt += '<' + extraNodes[i] + '>';
					}

					if (attrTxt == "" && nName == "span") {
						r = false;
					}
					if (r) {
						txt += '<' + nName;
						if (nName != 'br') {
							txt += attrTxt;
						}
					}
				}



				if (!nChild && !bkLib.inArray(this.noShort, attributeName)) {
					if (r) {
						txt += ' />';
					}
				} else {
					if (r) {
						txt += '>';
					}

					for (var i = 0; i < n.childNodes.length; i++) {
						var results = this.toXHTML(n.childNodes[i], true, true);
						if (results) {
							txt += results;
						}
					}
				}

				if (r && nChild) {
					txt += '</' + nName + '>';
				}

				for (var i = 0; i < extraNodes.length; i++) {
					txt += '</' + extraNodes[i] + '>';
				}

				break;
			case 3:
				//if(n.nodeValue != '\n') {
				txt += n.nodeValue;
				//}
				break;
		}

		return txt;
	}
});
nicEditors.registerPlugin(nicXHTML);



var nicBBCode = bkClass.extend({
	construct: function(nicEditor) {
		this.ne = nicEditor;
		if (this.ne.options.bbCode) {
			nicEditor.addEvent('get', this.bbGet.closure(this));
			nicEditor.addEvent('set', this.bbSet.closure(this));

			var loadedPlugins = this.ne.loadedPlugins;
			for (itm in loadedPlugins) {
				if (loadedPlugins[itm].toXHTML) {
					this.xhtml = loadedPlugins[itm];
				}
			}
		}
	},
	bbGet: function(ni) {
		var xhtml = this.xhtml.toXHTML(ni.getElm());
		ni.content = this.toBBCode(xhtml);
	},
	bbSet: function(ni) {
		ni.content = this.fromBBCode(ni.content);
	},
	toBBCode: function(xhtml) {
		function rp(r, m) {
			xhtml = xhtml.replace(r, m);
		}

		rp(/\n/gi, "");
		rp(/<strong>(.*?)<\/strong>/gi, "[b]$1[/b]");
		rp(/<em>(.*?)<\/em>/gi, "[i]$1[/i]");
		rp(/<span.*?style="text-decoration:underline;">(.*?)<\/span>/gi, "[u]$1[/u]");
		rp(/<ul>(.*?)<\/ul>/gi, "[list]$1[/list]");
		rp(/<li>(.*?)<\/li>/gi, "[*]$1[/*]");
		rp(/<ol>(.*?)<\/ol>/gi, "[list=1]$1[/list]");
		rp(/<img.*?src="(.*?)".*?>/gi, "[img]$1[/img]");
		rp(/<a.*?href="(.*?)".*?>(.*?)<\/a>/gi, "[url=$1]$2[/url]");
		rp(/<br.*?>/gi, "\n");
		rp(/<.*?>.*?<\/.*?>/gi, "");

		return xhtml;
	},
	fromBBCode: function(bbCode) {
		function rp(r, m) {
			bbCode = bbCode.replace(r, m);
		}

		rp(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>");
		rp(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>");
		rp(/\[u\](.*?)\[\/u\]/gi, "<span style=\"text-decoration:underline;\">$1</span>");
		rp(/\[list\](.*?)\[\/list\]/gi, "<ul>$1</ul>");
		rp(/\[list=1\](.*?)\[\/list\]/gi, "<ol>$1</ol>");
		rp(/\[\*\](.*?)\[\/\*\]/gi, "<li>$1</li>");
		rp(/\[img\](.*?)\[\/img\]/gi, "<img src=\"$1\" />");
		rp(/\[url=(.*?)\](.*?)\[\/url\]/gi, "<a href=\"$1\">$2</a>");
		rp(/\n/gi, "<br />");
		//rp(/\[.*?\](.*?)\[\/.*?\]/gi,"$1");

		return bbCode;
	}


});
nicEditors.registerPlugin(nicBBCode);



nicEditor = nicEditor.extend({
	floatingPanel: function() {
		this.floating = new bkElement('DIV').setStyle({position: 'absolute', top: '-1000px'}).appendTo(document.body);
		this.addEvent('focus', this.reposition.closure(this)).addEvent('blur', this.hide.closure(this));
		this.setPanel(this.floating);
	},
	reposition: function() {
		var e = this.selectedInstance.e;
		this.floating.setStyle({width: (parseInt(e.getStyle('width')) || e.clientWidth) + 'px'});
		var top = e.offsetTop - this.floating.offsetHeight;
		if (top < 0) {
			top = e.offsetTop + e.offsetHeight;
		}

		this.floating.setStyle({top: top + 'px', left: e.offsetLeft + 'px', display: 'block'});
	},
	hide: function() {
		this.floating.setStyle({top: '-1000px'});
	}
});



/* START CONFIG */
var nicCodeOptions = {
	buttons: {
		'xhtml': {name: 'Редактировать HTML', type: 'nicCodeButton'}
	}

};
/* END CONFIG */

var nicCodeButton = nicEditorAdvancedButton.extend({
	width: '350px',
	addPane: function() {
		this.addForm({
			'': {type: 'title', txt: 'Редактировать HTML'},
			'code': {type: 'content', 'value': this.ne.selectedInstance.getContent(), style: {width: '340px', height: '200px'}}
		});
	},
	submit: function(e) {
		var code = this.inputs['code'].value;
		this.ne.selectedInstance.setContent(code);
		this.removePane();
	}
});

nicEditors.registerPlugin(nicPlugin, nicCodeOptions);

/* Images Manager Button ver 2.1 - Lead Pepelats ©2014 ( http://lead-pepelats.ru/ ) */
var nicImgsMgrOptions = {
	buttons: {
		"imgsMgr": {name: "Менеджер изображений", type: "nicImgsMgrButton"}
	}
};

var nicImgsMgrButton = nicEditorAdvancedButton.extend({addPane: function() {
		this.uri = this.ne.options.imanagerURI;
		this.path = this.ne.options.imanagerPath;
		this.requestInterval = 1500;
		this.error = false;
		this.message;
		this.im = this.ne.selectedInstance.selElm().parentTag("IMG");
		this.mgr = new bkElement("DIV").setStyle({height: "auto", paddingBottom: "15px"}).appendTo(this.pane.pane);
		this.myForm = this.createElement('<form enctype="multipart/form-data"></form>').setAttributes({method: "post", action: this.uri, target: "frame"});
		this.frameWrapper = new bkElement("DIV").setStyle({display: "none"}).appendTo(this.pane.pane);
		this.myFrame = this.createElement('<iframe name="frame"></iframe>').setAttributes({src: this.uri}).appendTo(this.frameWrapper);
		setTimeout(this.updateList.closure(this, this.path), 50)
	}, getForm: function(A) {
		new bkElement("DIV").setStyle({margin: "15px 0px 15px 0px", fontSize: "12px", fontWeight: "bold"}).setContent("Загрузить изображение:").appendTo(this.myForm);
		this.submit = this.createElement('<input type="file" name="nicImg" />').addEvent("change", this.startUpload.closure(this, A)).setStyle({margin: "0px 0px 0px 15px", fontSize: "12px"}).appendTo(this.myForm);
		this.createElement('<input type="hidden" name="path" />').setAttributes({value: (typeof A != "undefined" ? A : "/")}).appendTo(this.myForm);
		return this.myForm;
	}, startUpload: function(A) {
		this.myForm.submit();
		this.submit.remove();
		new bkElement("DIV").setStyle({textAlign: "center", color: "green", margin: "10px 0px"}).setContent("Идёт загрузка файла. Подождите...").appendTo(this.myForm);
		setTimeout(this.getResponse.closure(this, A), this.requestInterval)
	}, getResponse: function(A) {
		var $this = this;
		var $A = A;
		var i = setInterval(function () {
			var data = $this.myFrame.contentWindow.document.body.innerHTML;
			if (data) {
				try {
					var response = eval("(" + (data) + ")");
					if (response.status == "error")
						$this.error = true;
					$this.message = response.message;
				}
				catch (e) {
					//this.error = true;
					//this.message = "Не удалось получить результат загрузки файла";
				}
				clearInterval(i);
				setTimeout($this.updateList.closure($this, $A), 500);
			}
		}, 1000);
	}, setMessage: function(E, T) {
		if (typeof E == "string") {
			var C = "000000";
			if (T == "error")
				C = "FF0000";
			if (T == "message")
				C = "009900";
			return new bkElement("DIV").setStyle({textAlign: "center", color: "#" + C, margin: "15px 0px 15px 0px", fontSize: "12px"}).setContent(E);
		}
	}, updateList: function(B) {
		this.mgr.setContent("");
		this.myForm.innerHTML = "";
		if (this.message) {
			this.setMessage(this.message, this.error ? "error" : "message").appendTo(this.myForm);
			this.error = this.message = "";
		}
		this.mgr.appendChild(this.getList(B));
	}, getList: function(A) {
		var list = new bkElement("DIV");
		if (typeof this.ne.options.imanagerURI == "string") {
			var wait = new bkElement("DIV").setStyle({margin: "30px 0px", textAlign: "center", fontSize: "12px"}).setContent("Подождите ...").appendTo(list);
			var $this = this;
			var $list = list;
			var xmlhttp;
			if (window.XMLHttpRequest)
				xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
			else
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
			xmlhttp.open("POST", this.ne.options.imanagerURI, true);
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						wait.setStyle({display: "none"});
						if (this.responseText) {
							console.log(this.responseText);
							try {
								var obj = eval("(" + this.responseText + ")");
								new bkElement("DIV").setAttributes({id: "path"}).setStyle({margin: "15px 0px 15px 0px", fontSize: "12px"}).setContent("<b>Путь:</b> " + obj.path).appendTo($list);
								if (typeof obj.items[".."] != "undefined")
									$this.createLi("..", obj.items[".."], obj.path).appendTo($list);
								for (var name in obj.items) {
									if (name == "..")
										continue;
									var item = obj.items[name];
									$this.createLi(name, item, obj.path).appendTo($list);
								}
							}
							catch (e) {
								$this.setMessage("Не удалось получить список файлов из-за некорректного ответа сервера", "error").appendTo($list);
								console.log(e);
							}
						}
						else
							$this.setMessage("Не удалось получить список файлов с сервера", "error").appendTo($list);
					}
				}
			}
			try {
				xmlhttp.send("path=" + (typeof A != "undefined" ? A : ""));
			}
			catch (e) {
				$this.setMessage("Не удалось получить список файлов с сервера", "error").appendTo($list);
				console.log(e);
			}
			this.mgr.appendChild(this.getForm(A));
		}
		else
			this.setMessage("В конфигурации NicEdit не установлены необходимые для работы менеджера изображений параметры (imanagerURI)", "error").appendTo(list);
		return list;
	}, createLi: function(name, item, path) {
		var host = this.ne.options.host;
		var info = item.type == "folder" ? "Папка" : item.width + " x " + item.height;
		var iconPic = item.thumb ? "url('" + (host ? host : '') + '/' + path + ".thumbs/" + item.hash + "_thumb." + (item.type == "bmp" ? "jpg" : item.type) + "')" : "none";
		var mainLi = new bkElement("DIV").setStyle({clear: "both", margin: "0px", padding: "1px 0px 1px 1px", fontSize: "12px", overflow: "hidden"});
		var li = new bkElement("DIV").setStyle({cursor: "pointer", float: "left", margin: "0px 20px 0px 0px", padding: "0px", fontSize: "12px", height: "37px", width: "100%"});
		var icon = new bkElement("DIV").setStyle({width: "36px", height: "36px", float: "left", margin: "0px 4px 0px 0", border: "1px solid #CCCCCC", backgroundColor: "transparent", backgroundImage: iconPic, backgroundRepeat: "no-repeat", backgroundPosition: "50% 50%"}).addEvent("mouseover", this.on.closure(this, li)).addEvent("mouseout", this.off.closure(this, li)).appendTo(li);
		if (iconPic == "none")
			new bkElement("DIV").setStyle({width: "18px", height: "18px", margin: "8px", backgroundImage: "url('" + this.ne.options.iconsPath + "')", backgroundRepeat: "no-repeat", backgroundPosition: ((typeof this.ne.options.iconList[item.type] != "undefined" ? this.ne.options.iconList[item.type] - 1 : 28) * -18) + "px 0px"}).appendTo(icon);
		new bkElement("DIV").setStyle({padding: "2px 0px 1px", whiteSpace: "nowrap", overflow: "hidden"}).setContent(name).addEvent("mouseover", this.on.closure(this, li)).addEvent("mouseout", this.off.closure(this, li)).appendTo(li);
		new bkElement("DIV").setStyle({padding: "2px 0px 1px", color: "#888888", fontSize: "11px", fontStyle: "italic"}).setContent(info).addEvent("mouseover", this.on.closure(this, li)).addEvent("mouseout", this.off.closure(this, li)).appendTo(li);
		if (item.type == "folder")
			li.addEvent("click", this.updateList.closure(this, path + name)).addEvent("mouseover", this.on.closure(this, li)).addEvent("mouseout", this.off.closure(this, li));
		else
			li.addEvent("click", this.image.closure(this, (host ? host : '') + '/' + path + name, name, item.preview ? item.preview_height : item.height, item.preview ? item.preview_width : item.width, (item.preview ? (host ? host : '') + '/' + path + ".thumbs/" + item.hash + "." + item.type : false)));
		if (item.type == "folder" && name == "..")
			var title = "Перейти на уровень выше";
		else if (item.type == "folder")
			var title = "Открыть папку";
		if (item.type != "folder")
			var title = "Вставить картинку";
		if (typeof title != "undefined")
			li.setAttribute("title", title);
		li.appendTo(mainLi)
		if (item.type != "folder") {
			li.setStyle({width: "225px"});
			var remove = new bkElement("DIV");
			remove.setAttribute("title", "Удалить файл");
			remove.setStyle({background: "red", cursor: "pointer", float: "right", margin: "1px", padding: "0", width: "18px", height: "38px", backgroundColor: "transparent", backgroundImage: "url('" + this.ne.options.iconsPath + "')", backgroundRepeat: "no-repeat", backgroundPosition: ((this.ne.options.iconList["close"] - 1) * -18) + "px 50%"});
			remove.addEvent("mouseover", this.on.closure(this, li)).addEvent("mouseout", this.off.closure(this, li)).addEvent("click", this.removeImg.closure(this, li, path, name));
			remove.appendTo(mainLi);
		}
		return mainLi;
	}, on: function(A) {
		A.parentNode.setStyle({backgroundColor: "#EEEEEE"})
	}, off: function(A) {
		A.parentNode.setStyle({backgroundColor: "transparent"})
	}, image: function(A, B, H, W, P) {
		this.removePane();
		if (!this.im) {
			var C = "javascript:nicImTemp();";
			this.ne.nicCommand("insertImage", C);
			this.im = this.findElm("IMG", "src", C)
		}
		if (this.im) {
			this.im.setAttributes({src: P ? P : A, alt: B, height: H, width: W});
			if (P) {
				var I = this.im.cloneNode(true);
				var L = this.createElement("<a></a>").setAttributes({"href": A, "target": "_blank", "rel": "lightbox"});
				L.appendChild(I);
				this.im.parentNode.replaceChild(L, this.im);
			}
		}
	}, removeImg: function(item, path, file) {
		if (confirm('Вы действительно хотите удалить файл `' + path + file + '`?')) {
			if (typeof this.ne.options.imanagerURI == "string") {
				var $this = this;
				var xmlhttp;
				if (window.XMLHttpRequest)
					xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
				else
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
				xmlhttp.open("POST", this.ne.options.imanagerURI, true);
				xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlhttp.onreadystatechange = function() {
					if (this.readyState == 4) {
						if (this.status == 200) {
							if (this.responseText) {
								console.log(this.responseText);
								try {
									var obj = eval("(" + this.responseText + ")");
									if (typeof obj.err != 'undefined') {
										alert(obj.err);
									}
									else if (typeof obj.ok != 'undefined') {
										item.parentNode.remove();
										alert(obj.ok);
									}
								}
								catch (e) {
									alert('Некорректный ответ сервера');
									console.log(e);
								}
							}
							else
								alert('Не удалось получить ответ от сервера');
						}
					}
				}
				try {
					xmlhttp.send("path=" + (typeof path != "undefined" ? path : "") + '&delete=' + file);
				}
				catch (e) {
					alert('Не удалось получить ответ от сервера');
					console.log(e);
				}
			}
			else
				alert('В конфигурации NicEdit не установлены необходимые для работы менеджера изображений параметры (imanagerURI)');
		}
	}, createElement: function(A) {
		if (typeof A == "string") {
			var tmp = document.createElement("div");
			tmp.innerHTML = A;
			tmp = $BK(tmp.firstChild);
			return tmp;
		}
	}});
nicEditors.registerPlugin(nicPlugin, nicImgsMgrOptions);

/* Table Buttons ver 1.0 - Lead Pepelats ©2014-2015 ( http://lead-pepelats.ru/ ) */
var nicTableOptions = {
	buttons: {
		"table": {name: __('Вставить/изменить таблицу'), tags: ['TABLE','TR','TD', 'TH'], type: "nicTableButton"},
		"row": {name: __('Свойства строки'), noActive: true, type: "nicRowButton"},
		"col": {name: __('Свойства ячейки'), noActive: true, type: "nicColButton"},
		"rowBefore": {name: __('Вставить строку перед'), noActive: true, type: "nicRowBeforeButton"},
		"rowAfter": {name: __('Вставить строку после'), noActive: true, type: "nicRowAfterButton"},
		"deleteRow": {name: __('Удалить строку'), noActive: true, type: "nicDeleteRowButton"},
		"colBefore": {name: __('Вставить столбец перед'), noActive: true, type: "nicColBeforeButton"},
		"colAfter": {name: __('Вставить столбец после'), noActive: true, type: "nicColAfterButton"},
		"deleteCol": {name: __('Удалить столбец'), noActive: true, type: "nicDeleteColButton"},
		"splitCells": {name: __('Разделить слитые ячейки'), noActive: true, type: "nicSplitCellsButton"},
		"mergeCells": {name: __('Объединить ячейки'), noActive: true, type: "nicMergeCellsButton"}
	}
};

var nicTableButton = nicEditorAdvancedButton.extend({
	addPane: function() {
		this.table = this.getTblElm('TABLE');
		this.addForm({
			'': {type: 'title', txt: (!this.table ? 'Добавить' : 'Изменить') + ' таблицу'},
			'cols': {type: (!this.table ? 'text' : 'hidden'), txt: 'Столбцов', style: {width: '40px'}},
			'rows': {type: (!this.table ? 'text' : 'hidden'), txt: 'Строк', style: {width: '40px'}},
			'cellPadding': {type: 'text', txt: 'Внутр. отступы ячеек', style: {width: '40px'}},
			'cellSpacing': {type: 'text', txt: 'Внешн. отступы ячеек', style: {width: '40px'}},
			'align': {type: 'select', txt: 'Выравн.', options: {none: 'По умолчанию', 'center': 'По центру', 'left': 'Слева', 'right': 'Справа'}},
			'border': {type: 'text', txt: 'Граница', style: {width: '40px'}},
			'width': {type: 'text', txt: 'Ширина', style: {width: '50px'}},
			'class': {type: 'text', txt: 'Класс', style: {width: '150px'}},
			'style': {type: 'text', txt: 'CSS стиль', style: {width: '150px'}}
		}, this.table);
	},
	submit: function(e) {
		this.removePane(true);
		var attrs = {
			'cellPadding': this.inputs['cellPadding'].value == "" ? "" : this.parseInt(this.inputs['cellPadding'].value),
			'cellSpacing': this.inputs['cellSpacing'].value == "" ? "" : this.parseInt(this.inputs['cellSpacing'].value),
			'align': this.inputs['align'].value,
			'border': this.inputs['border'].value == "" ? "" : this.parseInt(this.inputs['border'].value),
			'width': this.inputs['width'].value == "" ? "" : this.parseInt(this.inputs['width'].value, true),
			'class': this.inputs['class'].value,
			'style': this.inputs['style'].value
		}
		if (!this.table) {
			var cols = this.parseInt(this.inputs['cols'].value);
			var rows = this.parseInt(this.inputs['rows'].value);
			if (cols == 0 || rows == 0) {
				alert("Вы должны указать количество столбцов и количество строк чтобы вставить таблицу");
				return false;
			}
			var T = new bkElement("TABLE");
			var B = new bkElement("TBODY").appendTo(T);
			for (var i = 0; i < rows; i++) {
				var R = new bkElement("TR");
				for (var j = 0; j < cols; j++) {
					var C = new bkElement("TD").setContent('&nbsp;').appendTo(R);
				}
				R.appendTo(B);
			}
			T.setAttributes(attrs);
			var tmp = 'javascript:nicTableTemp();';
			this.ne.nicCommand("insertImage", tmp);
			this.table = this.findElm('IMG', 'src', tmp);
			this.table.parentNode.replaceChild(T, this.table);
		}
		else
			this.table.setAttributes(attrs);
	},
	removePane: function(C) {
		if (this.pane) {
			this.pane.remove();
			this.pane = null;
			if (C)
				this.ne.selectedInstance.restoreRng();
		}
	},
	parseInt: function(A, P) {
		var B = parseInt(A), C = '';
		if (P && A.substr(A.length - 1, 1) === '%')
			C = '%';
		return isNaN(B) ? 0 : B + C;
	},
	getElementsByClassName: function(classList, node) {
		if (!document.getElementsByClassName) {
			var node = node || document,
			list = node.getElementsByTagName('*'), 
			length = list.length,  
			classArray = classList.split(/\s+/), 
			classes = classArray.length, 
			result = [], i, j;
			for (i = 0; i < length; i++) {
				for (j = 0; j < classes; j++) {
					if (list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
						result.push(list[i]);
						break;
					}
				}
			}
			return result;
		}
		else
			return (node || document).getElementsByClassName(classList);
	},
	getTblElm: function(tag) {
		var E = $BK(this.ne.selectedInstance.selElm().parentTag(tag));
		var A = this.getElementsByClassName('nicEdit-main', E);
		return A.length == 0 ? E : false;
	},
	makeCellMap: function(table) {
		var rows = table.rows, cells, cell;
		var cx, cy, cw, ch, coff;
		var marr = [], mx, my, mw = 0, mh = 0;
		for (cy = 0; cy < rows.length; cy++) {
			cells = rows[cy].cells;
			for (cx = 0, coff = 0; cx < cells.length; cx++, coff += cw) {
				cell = cells[cx];
				cw = cell.colSpan;
				ch = cell.rowSpan;
				if (cw == 0 || ch == 0)
					return false;
				while (mh < cy + ch)
					marr[mh++] = [];
				while (typeof marr[cy][coff] != 'undefined')
					coff++;
				for (my = cy; my < cy + ch; my++) {
					for (mx = coff; mx < coff + cw; mx++) {
						if (typeof marr[my][mx] != 'undefined')
							return false;
						marr[my][mx] = cell;
					}
				}
				if (coff + cw > mw)
					mw = coff+cw;
			}
		}
		return { marr: marr, mw: mw, mh: mh };
	},
	getCellMap: function(table, invalidateCache) {
		var cellMap, cacheProp = "_cellMap";
		if (invalidateCache && typeof table[cacheProp] != 'undefined')
			table[cacheProp] = undefined;
		if (typeof table[cacheProp] == 'undefined') {
			cellMap = this.makeCellMap(table);
			if (cellMap === false)
				return false;
			table[cacheProp] = cellMap;
		}
		return table[cacheProp];
	},
	nextSibling: function (node) {
		var next = node.nextSibling;
		if (next != null)
			return next.nodeType == 1 ? next : this.nextSibling(next);
		return false;
	},
	previousSibling: function (node) {
		var previous = node.previousSibling;
		if (previous != null)
			return previous.nodeType == 1 ? previous : this.previousSibling(previous);
		return false;
	},
	getRowIndex: function(row) {
		var rows = row.parentNode.childNodes;
		var index = 0;
		for (i = 0; i < rows.length; i++) {
			if (rows[i].nodeType == 1) {
				if (rows[i] == row)
					return index;
				index++;
			}
		}
	},
	getColIndex: function(col) {
		var cellMap = this.getCellMap(col.parentTag('TABLE'), true);
		var rowIndex = this.getRowIndex(col.parentNode);
		var marr = cellMap.marr;
		for (i = 0; i < marr[rowIndex].length; i++) {
			cell = marr[rowIndex][i];
			if (cell === col)
				return i;
		}
	}
});
nicEditors.registerPlugin(nicPlugin, nicTableOptions);

var nicRowButton = nicTableButton.extend({
	addPane: function() {
		this.row = this.getTblElm('TR');
		if (!this.row) {
			this.removePane();
			return false;
		}
		this.addForm({
			'': {type: 'title', txt: 'Свойства строки'},
			'align': {type: 'select', txt: 'Выравн.', options: {none: 'По умолчанию', 'center': 'По центру', 'left': 'Слева', 'right': 'Справа'}},
			'vAlign': {type: 'select', txt: 'Вертикал. выравн.', options: {none: 'По умолчанию', 'middle': 'По центру', 'top': 'По верху', 'bottom': 'По низу'}},
			'class': {type: 'text', txt: 'Класс', style: {width: '150px'}},
			'style': {type: 'text', txt: 'CSS стиль', style: {width: '150px'}}
		}, this.row);
	},
	submit: function(e) {
		this.removePane();
		var attrs = {
			'align': this.inputs['align'].value,
			'vAlign': this.inputs['vAlign'].value,
			'class': this.inputs['class'].value,
			'style': this.inputs['style'].value
		}
		if (this.row)
			this.row.setAttributes(attrs);
	}
});

var nicColButton = nicTableButton.extend({
	addPane: function() {
		this.col = this.getTblElm('TD');
		if (!this.col)
			this.col = this.getTblElm('TH');
		if (!this.col) {
			this.removePane();
			return false;
		}
		this.tag = this.col.nodeName.toLowerCase();
		this.addForm({
			'': {type: 'title', txt: 'Свойства ячейки'},
			'type': {type: 'select', txt: 'Тип', options: {td: 'Данные', th: 'Заголовок'}, value: this.tag},
			'align': {type: 'select', txt: 'Выравн.', options: {none: 'По умолчанию', 'center': 'По центру', 'left': 'Слева', 'right': 'Справа'}},
			'vAlign': {type: 'select', txt: 'Вертикал. выравн.', options: {none: 'По умолчанию', 'middle': 'По центру', 'top': 'По верху', 'bottom': 'По низу'}},
			'width': {type: 'text', txt: 'Ширина', style: {width: '50px'}},
			'height': {type: 'text', txt: 'Высота', style: {width: '50px'}},
			'class': {type: 'text', txt: 'Класс', style: {width: '150px'}},
			'style': {type: 'text', txt: 'CSS стиль', style: {width: '150px'}}
		}, this.col);
	},
	submit: function(e) {
		this.removePane();
		var attrs = {
			'align': this.inputs['align'].value,
			'vAlign': this.inputs['vAlign'].value != 'none' ? this.inputs['vAlign'].value : '',
			'width': this.inputs['width'].value == "" ? "" : this.parseInt(this.inputs['width'].value, true),
			'height': this.inputs['height'].value == "" ? "" : this.parseInt(this.inputs['height'].value, true),
			'class': this.inputs['class'].value,
			'style': this.inputs['style'].value
		}
		if (this.col) {
			this.col.setAttributes(attrs);
			if (this.tag != this.inputs['type'].value.toLowerCase()) {
				var A = {};
				for (key in this.col.attributes) {
					if (typeof this.col.attributes[key] != 'undefined' && typeof this.col.attributes[key].nodeName != 'undefined')
						A[this.col.attributes[key].nodeName] = this.col.attributes[key].nodeValue;
				}
				A['class'] = this.col.className;
				A['style'] = this.col.style.cssText;
				var N = new bkElement(this.inputs['type'].value.toUpperCase()).setAttributes(A).setContent(this.col.innerHTML);
				this.col.parentNode.insertBefore(N, this.col);
				this.col.parentNode.removeChild(this.col);
			}
		}
	}
});

var nicRowBeforeButton = nicTableButton.extend({
	addPane: function() {
		this.table = this.getTblElm('TABLE');
		this.row = this.getTblElm('TR');
		this.removePane();
		if (!this.row)
			return false;
		this.insertRowBefore(this.table, this.getRowIndex(this.row));
	},
	insertRowBefore: function (table, row) {
		if (!isFinite(row) || row < 0 || row != Math.floor(row))
			return false;
		var cellMap = this.getCellMap(table, true);
		if (cellMap === false)
			return false;
		if (row >= cellMap.mh)
			return true;
		var trow = table.rows[row];
		var mrow = cellMap.marr[row], mrowPrev = cellMap.marr[row - 1];
		var mw = cellMap.mw, mh = cellMap.mh, mx, mxNext, ch, cw, cn;
		var cell, prevCell;
		var nrow = new bkElement('TR');
		trow.parentNode.insertBefore(nrow, trow);
		for (mx = 0; mx < mw;/* mx++*/) {
			cell = mrow[mx];
			prevCell = undefined;
			if (row > 0)
				prevCell = mrowPrev[mx];
			cw = cell.colSpan;
			ch = cell.rowSpan;
			if (cell !== prevCell) {
				nc = new bkElement('TD').setContent('&nbsp;');
				nc.colSpan = cw;
				nrow.appendChild(nc);
			}
			else
				cell.rowSpan++;
			mx += cw;
		}
		return true;
	}
});

var nicRowAfterButton = nicTableButton.extend({
	addPane: function() {
		this.table = this.getTblElm('TABLE');
		this.row = this.getTblElm('TR');
		this.removePane();
		if (!this.row)
			return false;
		this.insertRowAfter(this.table, this.getRowIndex(this.row));
	},
	insertRowAfter: function (table, row) {
		if (!isFinite(row) || row < 0 || row != Math.floor(row))
			return false;
		var cellMap = this.getCellMap(table, true);
		if (cellMap === false)
			return false;
		if (row >= cellMap.mh)
			return true;
		var trow = table.rows[row], trowNext = this.nextSibling(trow);
		var mrow = cellMap.marr[row], mrowNext = cellMap.marr[row + 1];
		var mw = cellMap.mw, mh = cellMap.mh, mx, mxNext, ch, cw, nc;
		var cell, nextCell;
		var nrow = new bkElement('TR');
		if (row === (mh - 1))
			trow.parentNode.appendChild(nrow);
		else
			trow.parentNode.insertBefore(nrow, trowNext);
		for (mx = 0; mx < mw;/* mx++*/) {
			cell = mrow[mx];
			nextCell = undefined;
			if (row < (mh - 1))
				nextCell = mrowNext[mx];
			ch = cell.rowSpan;
			cw = cell.colSpan;
			if (cell !== nextCell) {
				nc = new bkElement('TD').setContent('&nbsp;');
				nrow.appendChild(nc);
				if (cw > 1)
					nc.colSpan = cw;
			}
			else {
				if (ch > 1)
					cell.rowSpan = ch + 1;
			}
			mx += cw;
		}
		return true;
	}
});

var nicDeleteRowButton = nicTableButton.extend({
	addPane: function() {
		this.table = this.getTblElm('TABLE');
		this.row = this.getTblElm('TR');
		this.removePane();
		if (!this.row)
			return false;
		this.deleteRow(this.table, this.getRowIndex(this.row));
	},
	deleteRow: function (table, row) {
		if (!isFinite(row) || row < 0 || row != Math.floor(row))
			return false;
		var cellMap = this.getCellMap(table, true);
		if (cellMap === false)
			return false;
		if (row >= cellMap.mh)
			return true;
		var trow = table.rows[row], trowNext = this.nextSibling(trow);
		var mrow = cellMap.marr[row], mrowNext = cellMap.marr[row + 1];
		var mw = cellMap.mw, mh = cellMap.mh, mx, mxNext, ch;
		var cell, prevCell, nextCell;
		for (mx = 0; mx < mw; mx++) {
			cell = mrow[mx];
			if (cell !== prevCell && typeof cell != 'undefined') {
				ch = cell.rowSpan;
				if (ch > 1) {
					cell.rowSpan = ch - 1;
					if (ch == 2)
						cell.removeAttribute('rowSpan');
					if (cell.parentNode === trow) {
						trow.removeChild(cell);
						for (mxNext = mx + 1; ; mxNext++) {
							nextCell = mrowNext[mxNext];
							if (nextCell !== cell && (typeof nextCell == 'undefined' || nextCell.parentNode === trowNext))
								break;
						}
						if (typeof nextCell != 'undefined')
							trowNext.insertBefore(cell, nextCell);
						else
							trowNext.appendChild(cell);
					}
				}
				prevCell = cell;
			}
		}
		trow.parentNode.removeChild(trow);
		cellMap.marr.splice(row, 1);
		cellMap.mh--;
		return true;
	}
});

var nicColBeforeButton = nicTableButton.extend({
	addPane: function() {
		cell = this.getTblElm('TD');
		if (!cell)
			cell = this.getTblElm('TH');
		this.removePane();
		if (!cell)
			return false;
		this.insertColBefore(cell.parentTag('TABLE'), this.getColIndex(cell));
	},
	insertColBefore: function (table, col) {
		if (!isFinite(col) || col < 0 || col != Math.floor(col))
			return false;
		var cellMap = this.getCellMap(table);
		if (cellMap === false)
			return false;
		if (col >= cellMap.mw)
			return true;
		var row, cell, prevCell;
		var marr = cellMap.marr, mw = cellMap.mw, mh = cellMap.mh, my, mx, cw, ch, nc;
		for (my = 0; my < mh; my++) {
			row = marr[my];
			for (mx = 0; mx < mw; mx++) {
				cell = marr[my][mx];
				if (col == mx && cell == marr[my][col] && cell !== prevCell && typeof cell != 'undefined') {
					cw = cell.colSpan;
					ch = cell.rowSpan;
					if (cw > 1 && cell === marr[my][mx - 1])
						cell.colSpan = cw + 1;
					else
						nc = cell.parentNode.insertBefore(new bkElement('TD').setContent('&nbsp;'), cell);
					if (ch > 1)
						nc.rowSpan = ch;
					prevCell = cell;
				}
			}
			cellMap.mw++;
		}
		return true;
	}
});

var nicColAfterButton = nicTableButton.extend({
	addPane: function() {
		this.cell = this.getTblElm('TD');
		if (!this.cell)
			this.cell = this.getTblElm('TH');
		this.removePane();
		if (!this.cell)
			return false;
		this.insertColAfter(this.cell.parentTag('TABLE'), this.getColIndex(this.cell));
	},
	insertColAfter: function (table, col) {
		if (!isFinite(col) || col < 0 || col != Math.floor(col))
			return false;
		var cellMap = this.getCellMap(table, true);
		if (cellMap === false)
			return false;
		var marr = cellMap.marr, mw = cellMap.mw, mh = cellMap.mh, nc, nextCell;
		for (my = 0; my < mh; /*my++*/) {
			var row = table.rows[my];
			for (mx = 0; mx < mw; mx++) {
				if (mx > col)
					break;
				if (typeof marr[my][mx] != 'undefined')
					cell = marr[my][mx];
				nextCell = this.nextSibling(cell);
				if (col == mx && cell !== nextCell && typeof cell != 'undefined') {
					cw = cell.colSpan;
					ch = cell.rowSpan;
					if (cw > 1)
						cell.colSpan++;
					else {
						nc = new bkElement('TD').setContent('&nbsp;');
						if (nextCell)
							cell.parentNode.insertBefore(nc, nextCell);
						else
							cell.parentNode.appendChild(nc);
					}
					if (ch > 1 && typeof nc != 'undefined')
						nc.rowSpan = ch;
					my += ch;
				}
			}
		}
		return true;
	}
});

var nicDeleteColButton = nicTableButton.extend({
	addPane: function() {
		this.table = this.getTblElm('TABLE');
		cell = this.getTblElm('TD');
		if (!cell)
			cell = this.getTblElm('TH');
		this.removePane();
		if (!cell)
			return false;
		this.deleteCol(this.table, this.getColIndex(cell));
	},
	deleteCol: function (table, col) {
		if (!isFinite(col) || col < 0 || col != Math.floor(col))
			return false;
		var cellMap = this.getCellMap(table);
		if (cellMap === false)
			return false;
		if (col >= cellMap.mw)
			return true;
		var rows = table.rows, cell, prevCell;
		var marr = cellMap.marr, mw = cellMap.mw, mh = cellMap.mh, my, cw;
		for (my = 0; my < mh; my++) {
			cell = marr[my][col];
			if (cell !== prevCell && typeof cell != 'undefined') {
				cw = cell.colSpan;
				if (cw > 1) {
					cell.colSpan--;
					if (cell.colSpan == 1)
						cell.removeAttribute('colSpan');
				}
				else
					rows[my].removeChild(cell);
				prevCell = cell;
			}
			marr[my].splice(col, 1);
		}
		cellMap.mw--;
		return true;
	}
});

var nicSplitCellsButton = nicTableButton.extend({
	addPane: function() {
		this.cell = this.getTblElm('TD');
		if (!this.cell)
			this.cell = this.getTblElm('TH');
		if (!this.cell || (this.cell.colSpan < 2 && this.cell.rowSpan < 2)) {
			this.removePane();
			return false;
		}
		var opts = {};
		if (this.cell.colSpan > 1)
			opts['colSpan'] = 'на два столбца';
		if (this.cell.rowSpan > 1)
			opts['rowSpan'] = 'на две строки';
		this.addForm({
			'': {type: 'title', txt: 'Разделить слитые ячейки'},
			'mode': {type: 'select', txt: 'Разделить ячейки', options: opts}
		}, false);
	},
	submit: function() {
		this.removePane();
		switch (this.inputs['mode'].value) {
			case 'colSpan':
				return this.colSpan();
				break;
			case 'rowSpan':
				return this.rowSpan();
				break;
			default:
				return false;
		}
	},
	colSpan: function() {
		var row = this.cell.parentNode;
		var nextCell = this.nextSibling(this.cell);
		var cw = this.cell.colSpan
		var ch = this.cell.rowSpan;
		if (cw > 1) {
			var nc = new bkElement(this.cell.tagName).setContent('&nbsp;');
			this.cell.removeAttribute('colSpan');
			nc.colSpan = cw - 1;
			if (ch > 1)
				nc.rowSpan = ch;
			if (nextCell)
				row.insertBefore(nc, nextCell);
			else
				row.appendChild(nc);
		}
	},
	rowSpan: function() {
		var colIndex = this.getColIndex(this.cell);
		var rowIndex = this.getRowIndex(this.cell.parentTag('TR'));
		var table = this.cell.parentTag('TABLE');
		if (!table)
			return false;
		var cellMap = this.getCellMap(table);
		if (cellMap === false)
			return false;
		var marr = cellMap.marr, mw = cellMap.mw, mh = cellMap.mh, nc, nextCell;
		var nextRow = table.rows[rowIndex + 1];
		var cw = this.cell.colSpan
		var ch = this.cell.rowSpan;
		if (typeof nextRow == 'undefined')
			return false;
		if (ch > 1) {
			var nc = new bkElement(this.cell.tagName).setContent('&nbsp;');
			nc.rowSpan = ch - 1;
			if (cw > 1)
				nc.colSpan = cw;
			for (i in nextRow.cells) {
				if (typeof nextCell == 'undefined') {
					for (mx = colIndex; mx < mw; mx++) {
						if (nextRow.cells[i] == marr[rowIndex + 1][mx]) {
							nextCell = nextRow.cells[i];
							break;
						}
					}
				}
			}
			if (typeof nextCell != 'undefined')
				table.rows[rowIndex + 1].insertBefore(nc, nextCell);
			else
				table.rows[rowIndex + 1].appendChild(nc);
			this.cell.removeAttribute('rowSpan');
		}
	}
});

var nicMergeCellsButton = nicTableButton.extend({
	addPane: function() {
		this.cell = this.getTblElm('TD');
		if (!this.cell)
			this.cell = this.getTblElm('TH');
		if (!this.cell) {
			this.removePane();
			return false;
		}
		this.table = this.cell.parentTag('TABLE');
		if (!this.table)
			return false;
		this.colIndex = this.getColIndex(this.cell);
		this.rowIndex = this.getRowIndex(this.cell.parentTag('TR'));
		var cellMap = this.getCellMap(this.table);
		var marr = cellMap.marr, mw = cellMap.mw, nextRowColIndex;
		this.nextRow = marr[this.rowIndex + this.cell.rowSpan];
		this.prevCell = this.nextCell = undefined;
		if (typeof marr[this.rowIndex - 1] != 'undefined') {
			prevRowCell = marr[this.rowIndex - 1][this.colIndex];
			if (typeof prevRowCell != 'undefined') {
				this.prevRow = marr[this.rowIndex - prevRowCell.rowSpan];
				this.prevRowCell = this.prevRow[this.colIndex];
			}
		}
		for (mx = 0; mx < mw; mx++) {
			if (this.colIndex && mx < this.colIndex)
					this.prevCell = marr[this.rowIndex][mx];
			if (mx >= this.colIndex && this.cell != marr[this.rowIndex][mx]) {
				if (marr[this.rowIndex][mx] === this.nextSibling(this.cell))
					this.nextCell = marr[this.rowIndex][mx];
				break;
			}
		}
		if (typeof this.nextRow !== 'undefined')
			this.nextRowCell = this.nextRow[this.colIndex];
		var opts = {};
		if (typeof this.prevCell !== 'undefined') {
			if (this.prevCell.rowSpan === this.cell.rowSpan && this.prevCell === this.previousSibling(this.cell))
				opts['colSpanLeft'] = 'ячейкой слева';
		}
		if (typeof this.nextCell !== 'undefined') {
			if (this.nextCell.rowSpan === this.cell.rowSpan)
				opts['colSpanRight'] = 'ячейкой справа';
		}
		if (typeof this.prevRow !== 'undefined') {
			if (typeof this.prevRowCell !== 'undefined' && this.prevRowCell !== this.prevRow[this.colIndex - 1]) {
				if (this.prevRowCell.colSpan === this.cell.colSpan)
					opts['rowSpanTop'] = 'ячейкой выше';
			}
		}
		if (typeof this.nextRow !== 'undefined') {
			if (typeof this.nextRowCell !== 'undefined' && this.nextRowCell !== this.nextRow[this.colIndex - 1]) {
				if (this.nextRowCell.colSpan === this.cell.colSpan)
					opts['rowSpanBottom'] = 'ячейкой ниже';
			}
		}
		var i = false;
		for (var k in opts) {
			i = true;
			break;
		}
		if (!i) {
			this.removePane();
			return false;
		}
		this.addForm({
			'': {type: 'title', txt: 'Объединение ячеек'},
			'mode': {type: 'select', txt: 'Объединить с', options: opts}
		}, false);
	},
	submit: function() {
		this.removePane();
		switch (this.inputs['mode'].value) {
			case 'colSpanLeft':
				this.prevCell.colSpan += this.cell.colSpan;
				this.cell.parentNode.removeChild(this.cell);
				break;
			case 'colSpanRight':
				this.cell.colSpan += this.nextCell.colSpan;
				this.nextCell.parentNode.removeChild(this.nextCell);
				break;
			case 'rowSpanTop':
				this.prevRowCell.rowSpan += this.cell.rowSpan;
				this.cell.parentNode.removeChild(this.cell);
				break;
			case 'rowSpanBottom':
				this.cell.rowSpan += this.nextRowCell.rowSpan;
				this.nextRowCell.parentNode.removeChild(this.nextRowCell);
				break;
			default:
				return false;
		}
		return true;
	}
});
