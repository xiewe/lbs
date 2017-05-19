(function() {
	var toPixels = function(widthValue) {
		var px;
		switch (widthValue) {
		case "thin":
			px = "2px";
			break;
		case "medium":
			px = "4px";
			break;
		case "thick":
			px = "6px";
			break;
		default:
			px = widthValue;
		}
		return px;
	};
	var getBorderWidths = function(h) {
		var computedStyle;
		var bw = {};
		if (document.defaultView && document.defaultView.getComputedStyle) {
			computedStyle = h.ownerDocument.defaultView.getComputedStyle(h, "");
			if (computedStyle) {
				// The computed styles are always in pixel units (good!)
				bw.top = parseInt(computedStyle.borderTopWidth, 10) || 0;
				bw.bottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
				bw.left = parseInt(computedStyle.borderLeftWidth, 10) || 0;
				bw.right = parseInt(computedStyle.borderRightWidth, 10) || 0;
				return bw;
			}
		} else if (document.documentElement.currentStyle) { // MSIE
			if (h.currentStyle) {
				// The current styles may not be in pixel units so try to
				// convert (bad!)
				bw.top = parseInt(toPixels(h.currentStyle.borderTopWidth), 10) || 0;
				bw.bottom = parseInt(toPixels(h.currentStyle.borderBottomWidth), 10) || 0;
				bw.left = parseInt(toPixels(h.currentStyle.borderLeftWidth), 10) || 0;
				bw.right = parseInt(toPixels(h.currentStyle.borderRightWidth), 10) || 0;
				return bw;
			}
		}
		// Shouldn't get this far for any modern browser
		bw.top = parseInt(h.style["border-top-width"], 10) || 0;
		bw.bottom = parseInt(h.style["border-bottom-width"], 10) || 0;
		bw.left = parseInt(h.style["border-left-width"], 10) || 0;
		bw.right = parseInt(h.style["border-right-width"], 10) || 0;
		return bw;
	};

	var scroll = {
		x : 0,
		y : 0
	};
	var getScrollValue = function(e) {
		scroll.x = (typeof document.documentElement.scrollLeft !== "undefined" ? document.documentElement.scrollLeft : document.body.scrollLeft);
		scroll.y = (typeof document.documentElement.scrollTop !== "undefined" ? document.documentElement.scrollTop : document.body.scrollTop);
	};
	getScrollValue();

	/**
	 * Get the position of the mouse relative to the document.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 * @return {Object} The position object {left, top}.
	 */
	var getMousePosition = function(e) {
		var posX = 0, posY = 0;
		e = e || window.event;
		if (typeof e.pageX !== "undefined") {
			posX = e.pageX;
			posY = e.pageY;
		} else if (typeof e.clientX !== "undefined") { // MSIE
			posX = e.clientX + scroll.x;
			posY = e.clientY + scroll.y;
		}
		return {
			left : posX,
			top : posY
		};
	};
	/**
	 * Get the position of an HTML element relative to the document.
	 * 
	 * @param {Node}
	 *            h The HTML element.
	 * @return {Object} The position object {left, top}.
	 */
	var getElementPosition = function(h) {
		var posX = h.offsetLeft;
		var posY = h.offsetTop;
		var parent = h.offsetParent;
		// Add offsets for all ancestors in the hierarchy
		while (parent !== null) {
			// Adjust for scrolling elements which may affect the map position.
			if (parent !== document.body && parent !== document.documentElement) {
				posX -= parent.scrollLeft;
				posY -= parent.scrollTop;
			}
			var m = parent;
			// This is the "normal" way to get offset information:
			var moffx = m.offsetLeft;
			var moffy = m.offsetTop;
			// This covers those cases where a transform is used:
			if (!moffx && !moffy && window.getComputedStyle) {
				var matrix = document.defaultView.getComputedStyle(m, null).MozTransform || document.defaultView.getComputedStyle(m, null).WebkitTransform;
				if (matrix) {
					if (typeof matrix === "string") {
						var parms = matrix.split(",");
						moffx += parseInt(parms[4], 10) || 0;
						moffy += parseInt(parms[5], 10) || 0;
					}
				}
			}
			posX += moffx;
			posY += moffy;
			parent = parent.offsetParent;
		}
		return {
			left : posX,
			top : posY
		};
	};
	/**
	 * Set the properties of an object to those from another object.
	 * 
	 * @param {Object}
	 *            obj The target object.
	 * @param {Object}
	 *            vals The source object.
	 */
	var setVals = function(obj, vals) {
		if (obj && vals) {
			for ( var x in vals) {
				if (vals.hasOwnProperty(x)) {
					obj[x] = vals[x];
				}
			}
		}
		return obj;
	};
	/**
	 * Set the opacity. If op is not passed in, this function just performs an
	 * MSIE fix.
	 * 
	 * @param {Node}
	 *            h The HTML element.
	 * @param {number}
	 *            op The opacity value (0-1).
	 */
	var setOpacity = function(h, op) {
		if (typeof op !== "undefined") {
			h.style.opacity = op;
		}
		if (typeof h.style.opacity !== "undefined" && h.style.opacity !== "") {
			h.style.filter = "alpha(opacity=" + (h.style.opacity * 100) + ")";
		}
	};

	function DragZoom(map, opt_zoomOpts) {
		var me = this;
		var ov = new google.maps.OverlayView();
		ov.onAdd = function() {
			me.init_(map, opt_zoomOpts);
		};
		ov.draw = function() {
		};
		ov.onRemove = function() {
		};
		ov.setMap(map);
		this.prjov_ = ov;
	}

	DragZoom.prototype.init_ = function(map, opt_zoomOpts) {
		var i;
		var me = this;
		this.map_ = map;
		opt_zoomOpts = opt_zoomOpts || {};
		this.key_ = opt_zoomOpts.key || "shift";
		this.key_ = this.key_.toLowerCase();
		this.borderWidths_ = getBorderWidths(this.map_.getDiv());
		this.veilDiv_ = [];
		for (i = 0; i < 4; i++) {
			this.veilDiv_[i] = document.createElement("div");
			this.veilDiv_[i].onselectstart = function() {
				return false;
			};
			// Apply default style values for the veil:
			setVals(this.veilDiv_[i].style, {
				backgroundColor : "gray",
				opacity : 0.25,
				cursor : "crosshair"
			});
			// Apply style values specified in veilStyle parameter:
			setVals(this.veilDiv_[i].style, opt_zoomOpts.paneStyle); // Old
			setVals(this.veilDiv_[i].style, opt_zoomOpts.veilStyle); // New
			// Apply mandatory style values:
			setVals(this.veilDiv_[i].style, {
				position : "absolute",
				overflow : "hidden",
				display : "none"
			});
			// Workaround for Firefox Shift-Click problem:
			if (this.key_ === "shift") {
				this.veilDiv_[i].style.MozUserSelect = "none";
			}
			setOpacity(this.veilDiv_[i]);
			if (this.veilDiv_[i].style.backgroundColor === "transparent") {
				this.veilDiv_[i].style.backgroundColor = "white";
				setOpacity(this.veilDiv_[i], 0);
			}
			this.map_.getDiv().appendChild(this.veilDiv_[i]);
		}

		this.visualEnabled_ = opt_zoomOpts.visualEnabled || false;
		this.visualClass_ = opt_zoomOpts.visualClass || "";
		this.visualPosition_ = opt_zoomOpts.visualPosition || google.maps.ControlPosition.LEFT_TOP;
		this.visualPositionOffset_ = opt_zoomOpts.visualPositionOffset || new google.maps.Size(35, 0);
		this.visualPositionIndex_ = opt_zoomOpts.visualPositionIndex || null;
		this.visualSprite_ = opt_zoomOpts.visualSprite || "../dragzoom_btn.png";
		this.visualSize_ = opt_zoomOpts.visualSize || new google.maps.Size(20, 20);
		this.visualTips_ = opt_zoomOpts.visualTips || {};
		this.visualTips_.off = this.visualTips_.off || "Turn on drag zoom mode";
		this.visualTips_.on = this.visualTips_.on || "Turn off drag zoom mode";

		this.boxDiv_ = document.createElement("div");
		// Apply default style values for the zoom box:
		setVals(this.boxDiv_.style, {
			border : "4px solid #736AFF"
		});
		// Apply style values specified in boxStyle parameter:
		setVals(this.boxDiv_.style, opt_zoomOpts.boxStyle);
		// Apply mandatory style values:
		setVals(this.boxDiv_.style, {
			position : "absolute",
			display : "none"
		});
		setOpacity(this.boxDiv_);
		this.map_.getDiv().appendChild(this.boxDiv_);
		this.boxBorderWidths_ = getBorderWidths(this.boxDiv_);

		this.listeners_ = [ google.maps.event.addDomListener(document, "keydown", function(e) {
			me.onKeyDown_(e);
		}), google.maps.event.addDomListener(document, "keyup", function(e) {
			me.onKeyUp_(e);
		}), google.maps.event.addDomListener(this.veilDiv_[0], "mousedown", function(e) {
			me.onMouseDown_(e);
		}), google.maps.event.addDomListener(this.veilDiv_[1], "mousedown", function(e) {
			me.onMouseDown_(e);
		}), google.maps.event.addDomListener(this.veilDiv_[2], "mousedown", function(e) {
			me.onMouseDown_(e);
		}), google.maps.event.addDomListener(this.veilDiv_[3], "mousedown", function(e) {
			me.onMouseDown_(e);
		}), google.maps.event.addDomListener(document, "mousedown", function(e) {
			me.onMouseDownDocument_(e);
		}), google.maps.event.addDomListener(document, "mousemove", function(e) {
			me.onMouseMove_(e);
		}), google.maps.event.addDomListener(document, "mouseup", function(e) {
			me.onMouseUp_(e);
		}), google.maps.event.addDomListener(window, "scroll", getScrollValue) ];

		this.hotKeyDown_ = false;
		this.mouseDown_ = false;
		this.dragging_ = false;
		this.startPt_ = null;
		this.endPt_ = null;
		this.mapWidth_ = null;
		this.mapHeight_ = null;
		this.mousePosn_ = null;
		this.mapPosn_ = null;

		if (this.visualEnabled_) {
			this.buttonDiv_ = this.initControl_(this.visualPositionOffset_);
			if (this.visualPositionIndex_ !== null) {
				this.buttonDiv_.index = this.visualPositionIndex_;
			}
			this.map_.controls[this.visualPosition_].push(this.buttonDiv_);
			this.controlIndex_ = this.map_.controls[this.visualPosition_].length - 1;
		}
	};
	DragZoom.prototype.initControl_ = function(offset) {
		var control;
		var image;
		var me = this;

		control = document.createElement("div");
		control.className = this.visualClass_;
		control.style.position = "relative";
		control.style.overflow = "hidden";
		control.style.height = this.visualSize_.height + "px";
		control.style.width = this.visualSize_.width + "px";
		control.title = this.visualTips_.off;
		image = document.createElement("img");
		image.src = this.visualSprite_;
		image.style.position = "absolute";
		image.style.left = -(this.visualSize_.width * 2) + "px";
		image.style.top = 0 + "px";
		control.appendChild(image);
		control.onclick = function(e) {
			me.gdcDrag();
		};
		control.onmouseover = function() {
			me.buttonDiv_.firstChild.style.left = -(me.visualSize_.width * 1) + "px";
		};
		control.onmouseout = function() {
			if (me.hotKeyDown_) {
				me.buttonDiv_.firstChild.style.left = -(me.visualSize_.width * 0) + "px";
				me.buttonDiv_.title = me.visualTips_.on;
			} else {
				me.buttonDiv_.firstChild.style.left = -(me.visualSize_.width * 2) + "px";
				me.buttonDiv_.title = me.visualTips_.off;
			}
		};
		control.ondragstart = function() {
			return false;
		};
		setVals(control.style, {
			cursor : "pointer",
			marginTop : offset.height + "px",
			marginLeft : offset.width + "px"
		});
		return control;
	};
	DragZoom.prototype.gdcDrag = function(e) {
		this.hotKeyDown_ = !this.hotKeyDown_;
		if (this.hotKeyDown_) {
			this.buttonDiv_.firstChild.style.left = -(this.visualSize_.width * 0) + "px";
			this.buttonDiv_.title = me.visualTips_.on;
			this.activatedByControl_ = true;
			google.maps.event.trigger(this, "activate");
		} else {
			this.buttonDiv_.firstChild.style.left = -(me.visualSize_.width * 2) + "px";
			this.buttonDiv_.title = me.visualTips_.off;
			google.maps.event.trigger(this, "deactivate");
		}
		this.onMouseMove_(e); // Updates the veil

	};

	/**
	 * Returns <code>true</code> if the hot key is being pressed when an event
	 * occurs.
	 * 
	 * @param {Event}
	 *            e The keyboard event.
	 * @return {boolean} Flag indicating whether the hot key is down.
	 */
	DragZoom.prototype.isHotKeyDown_ = function(e) {
		var isHot;
		e = e || window.event;
		isHot = (e.shiftKey && this.key_ === "shift") || (e.altKey && this.key_ === "alt") || (e.ctrlKey && this.key_ === "ctrl");
		if (!isHot) {
			switch (e.keyCode) {
			case 16:
				if (this.key_ === "shift") {
					isHot = true;
				}
				break;
			case 17:
				if (this.key_ === "ctrl") {
					isHot = true;
				}
				break;
			case 18:
				if (this.key_ === "alt") {
					isHot = true;
				}
				break;
			}
		}
		return isHot;
	};

	DragZoom.prototype.isMouseOnMap_ = function() {
		var mousePosn = this.mousePosn_;
		if (mousePosn) {
			var mapPosn = this.mapPosn_;
			var mapDiv = this.map_.getDiv();
			return mousePosn.left > mapPosn.left && mousePosn.left < (mapPosn.left + mapDiv.offsetWidth) && mousePosn.top > mapPosn.top && mousePosn.top < (mapPosn.top + mapDiv.offsetHeight);
		} else {
			// if user never moved mouse
			return false;
		}
	};
	/**
	 * Show the veil if the hot key is down and the mouse is over the map,
	 * otherwise hide the veil.
	 */
	DragZoom.prototype.setVeilVisibility_ = function() {
		var i;
		if (this.map_ && this.hotKeyDown_ && this.isMouseOnMap_()) {
			var mapDiv = this.map_.getDiv();
			this.mapWidth_ = mapDiv.offsetWidth - (this.borderWidths_.left + this.borderWidths_.right);
			this.mapHeight_ = mapDiv.offsetHeight - (this.borderWidths_.top + this.borderWidths_.bottom);
			if (this.activatedByControl_) { // Veil covers entire map (except
				// control)
				var left = parseInt(this.buttonDiv_.style.left, 10) + this.visualPositionOffset_.width;
				var top = parseInt(this.buttonDiv_.style.top, 10) + this.visualPositionOffset_.height;
				var width = this.visualSize_.width;
				var height = this.visualSize_.height;
				// Left veil rectangle:
				this.veilDiv_[0].style.top = "0px";
				this.veilDiv_[0].style.left = "0px";
				this.veilDiv_[0].style.width = left + "px";
				this.veilDiv_[0].style.height = this.mapHeight_ + "px";
				// Right veil rectangle:
				this.veilDiv_[1].style.top = "0px";
				this.veilDiv_[1].style.left = (left + width) + "px";
				this.veilDiv_[1].style.width = (this.mapWidth_ - (left + width)) + "px";
				this.veilDiv_[1].style.height = this.mapHeight_ + "px";
				// Top veil rectangle:
				this.veilDiv_[2].style.top = "0px";
				this.veilDiv_[2].style.left = left + "px";
				this.veilDiv_[2].style.width = width + "px";
				this.veilDiv_[2].style.height = top + "px";
				// Bottom veil rectangle:
				this.veilDiv_[3].style.top = (top + height) + "px";
				this.veilDiv_[3].style.left = left + "px";
				this.veilDiv_[3].style.width = width + "px";
				this.veilDiv_[3].style.height = (this.mapHeight_ - (top + height)) + "px";
				for (i = 0; i < this.veilDiv_.length; i++) {
					this.veilDiv_[i].style.display = "block";
				}
			} else {
				this.veilDiv_[0].style.left = "0px";
				this.veilDiv_[0].style.top = "0px";
				this.veilDiv_[0].style.width = this.mapWidth_ + "px";
				this.veilDiv_[0].style.height = this.mapHeight_ + "px";
				for (i = 1; i < this.veilDiv_.length; i++) {
					this.veilDiv_[i].style.width = "0px";
					this.veilDiv_[i].style.height = "0px";
				}
				for (i = 0; i < this.veilDiv_.length; i++) {
					this.veilDiv_[i].style.display = "block";
				}
			}
		} else {
			for (i = 0; i < this.veilDiv_.length; i++) {
				this.veilDiv_[i].style.display = "none";
			}
		}
	};
	/**
	 * Handle key down. Show the veil if the hot key has been pressed.
	 * 
	 * @param {Event}
	 *            e The keyboard event.
	 */
	DragZoom.prototype.onKeyDown_ = function(e) {
		if (this.map_ && !this.hotKeyDown_ && this.isHotKeyDown_(e)) {
			this.mapPosn_ = getElementPosition(this.map_.getDiv());
			this.hotKeyDown_ = true;
			this.activatedByControl_ = false;
			this.setVeilVisibility_();
			/**
			 * This event is fired when the hot key is pressed.
			 * 
			 * @name DragZoom#activate
			 * @event
			 */
			google.maps.event.trigger(this, "activate");
		}
		if (this.visualEnabled_ && this.isHotKeyDown_(e)) {
			this.buttonDiv_.style.display = "none";
		}
	};
	/**
	 * Get the <code>google.maps.Point</code> of the mouse position.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 * @return {Point} The mouse position.
	 */
	DragZoom.prototype.getMousePoint_ = function(e) {
		var mousePosn = getMousePosition(e);
		var p = new google.maps.Point();
		p.x = mousePosn.left - this.mapPosn_.left - this.borderWidths_.left;
		p.y = mousePosn.top - this.mapPosn_.top - this.borderWidths_.top;
		p.x = Math.min(p.x, this.mapWidth_);
		p.y = Math.min(p.y, this.mapHeight_);
		p.x = Math.max(p.x, 0);
		p.y = Math.max(p.y, 0);
		return p;
	};
	/**
	 * Handle mouse down.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 */
	DragZoom.prototype.onMouseDown_ = function(e) {
		if (this.map_ && this.hotKeyDown_) {
			this.mapPosn_ = getElementPosition(this.map_.getDiv());
			this.dragging_ = true;
			this.startPt_ = this.endPt_ = this.getMousePoint_(e);
			this.boxDiv_.style.width = this.boxDiv_.style.height = "0px";
			var prj = this.prjov_.getProjection();
			var latlng = prj.fromContainerPixelToLatLng(this.startPt_);
			if (this.visualEnabled_) {
				this.buttonDiv_.style.display = "none";
			}
			/**
			 * This event is fired when the drag operation begins. The parameter
			 * passed is the geographic position of the starting point.
			 * 
			 * @name DragZoom#dragstart
			 * @param {LatLng}
			 *            latlng The geographic position of the starting point.
			 * @event
			 */
			google.maps.event.trigger(this, "dragstart", latlng);
		}
	};
	/**
	 * Handle mouse down at the document level.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 */
	DragZoom.prototype.onMouseDownDocument_ = function(e) {
		this.mouseDown_ = true;
	};
	/**
	 * Handle mouse move.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 */
	DragZoom.prototype.onMouseMove_ = function(e) {
		this.mousePosn_ = getMousePosition(e);
		if (this.dragging_) {
			this.endPt_ = this.getMousePoint_(e);
			var left = Math.min(this.startPt_.x, this.endPt_.x);
			var top = Math.min(this.startPt_.y, this.endPt_.y);
			var width = Math.abs(this.startPt_.x - this.endPt_.x);
			var height = Math.abs(this.startPt_.y - this.endPt_.y);
			// For benefit of MSIE 7/8 ensure following values are not negative:
			var boxWidth = Math.max(0, width - (this.boxBorderWidths_.left + this.boxBorderWidths_.right));
			var boxHeight = Math.max(0, height - (this.boxBorderWidths_.top + this.boxBorderWidths_.bottom));
			// Left veil rectangle:
			this.veilDiv_[0].style.top = "0px";
			this.veilDiv_[0].style.left = "0px";
			this.veilDiv_[0].style.width = left + "px";
			this.veilDiv_[0].style.height = this.mapHeight_ + "px";
			// Right veil rectangle:
			this.veilDiv_[1].style.top = "0px";
			this.veilDiv_[1].style.left = (left + width) + "px";
			this.veilDiv_[1].style.width = (this.mapWidth_ - (left + width)) + "px";
			this.veilDiv_[1].style.height = this.mapHeight_ + "px";
			// Top veil rectangle:
			this.veilDiv_[2].style.top = "0px";
			this.veilDiv_[2].style.left = left + "px";
			this.veilDiv_[2].style.width = width + "px";
			this.veilDiv_[2].style.height = top + "px";
			// Bottom veil rectangle:
			this.veilDiv_[3].style.top = (top + height) + "px";
			this.veilDiv_[3].style.left = left + "px";
			this.veilDiv_[3].style.width = width + "px";
			this.veilDiv_[3].style.height = (this.mapHeight_ - (top + height)) + "px";
			// Selection rectangle:
			this.boxDiv_.style.top = top + "px";
			this.boxDiv_.style.left = left + "px";
			this.boxDiv_.style.width = boxWidth + "px";
			this.boxDiv_.style.height = boxHeight + "px";
			this.boxDiv_.style.display = "block";
			/**
			 * This event is fired repeatedly while the user drags a box across
			 * the area of interest. The southwest and northeast point are
			 * passed as parameters of type <code>google.maps.Point</code>
			 * (for performance reasons), relative to the map container. Also
			 * passed is the projection object so that the event listener, if
			 * necessary, can convert the pixel positions to geographic
			 * coordinates using
			 * <code>google.maps.MapCanvasProjection.fromContainerPixelToLatLng</code>.
			 * 
			 * @name DragZoom#drag
			 * @param {Point}
			 *            southwestPixel The southwest point of the selection
			 *            area.
			 * @param {Point}
			 *            northeastPixel The northeast point of the selection
			 *            area.
			 * @param {MapCanvasProjection}
			 *            prj The projection object.
			 * @event
			 */
			google.maps.event.trigger(this, "drag", new google.maps.Point(left, top + height), new google.maps.Point(left + width, top), this.prjov_.getProjection());
		} else if (!this.mouseDown_) {
			this.mapPosn_ = getElementPosition(this.map_.getDiv());
			this.setVeilVisibility_();
		}
	};
	/**
	 * Handle mouse up.
	 * 
	 * @param {Event}
	 *            e The mouse event.
	 */
	DragZoom.prototype.onMouseUp_ = function(e) {
		var z;
		var me = this;
		this.mouseDown_ = false;
		if (this.dragging_) {
			if ((this.getMousePoint_(e).x === this.startPt_.x) && (this.getMousePoint_(e).y === this.startPt_.y)) {
				this.onKeyUp_(e); // Cancel event
				return;
			}
			var left = Math.min(this.startPt_.x, this.endPt_.x);
			var top = Math.min(this.startPt_.y, this.endPt_.y);
			var width = Math.abs(this.startPt_.x - this.endPt_.x);
			var height = Math.abs(this.startPt_.y - this.endPt_.y);
			// Google Maps API bug: setCenter() doesn't work as expected if the
			// map has a
			// border on the left or top. The code here includes a workaround
			// for this problem.
			var kGoogleCenteringBug = true;
			if (kGoogleCenteringBug) {
				left += this.borderWidths_.left;
				top += this.borderWidths_.top;
			}

			var prj = this.prjov_.getProjection();
			var sw = prj.fromContainerPixelToLatLng(new google.maps.Point(left, top + height));
			var ne = prj.fromContainerPixelToLatLng(new google.maps.Point(left + width, top));
			var bnds = new google.maps.LatLngBounds(sw, ne);

			// Redraw box after zoom:
			var swPt = prj.fromLatLngToContainerPixel(sw);
			var nePt = prj.fromLatLngToContainerPixel(ne);
			if (kGoogleCenteringBug) {
				swPt.x -= this.borderWidths_.left;
				swPt.y -= this.borderWidths_.top;
				nePt.x -= this.borderWidths_.left;
				nePt.y -= this.borderWidths_.top;
			}
			this.boxDiv_.style.left = swPt.x + "px";
			this.boxDiv_.style.top = nePt.y + "px";
			this.boxDiv_.style.width = (Math.abs(nePt.x - swPt.x) - (this.boxBorderWidths_.left + this.boxBorderWidths_.right)) + "px";
			this.boxDiv_.style.height = (Math.abs(nePt.y - swPt.y) - (this.boxBorderWidths_.top + this.boxBorderWidths_.bottom)) + "px";
			// Hide box asynchronously after 1 second:
			setTimeout(function() {
				me.boxDiv_.style.display = "none";
			}, 100);
			this.dragging_ = false;
			this.onMouseMove_(e); // Updates the veil
			/**
			 * This event is fired when the drag operation ends. The parameter
			 * passed is the geographic bounds of the selected area. Note that
			 * this event is <i>not</i> fired if the hot key is released before
			 * the drag operation ends.
			 * 
			 * @name DragZoom#dragend
			 * @param {LatLngBounds}
			 *            bnds The geographic bounds of the selected area.
			 * @event
			 */
			google.maps.event.trigger(this, "dragend", bnds);
			// if the hot key isn't down, the drag zoom must have been activated
			// by turning
			// on the visual control. In this case, finish up by simulating a
			// key up event.
			if (!this.isHotKeyDown_(e)) {
				this.onKeyUp_(e);
			}
		}
	};
	/**
	 * Handle key up.
	 * 
	 * @param {Event}
	 *            e The keyboard event.
	 */
	DragZoom.prototype.onKeyUp_ = function(e) {
		var i;
		if (this.map_ && this.hotKeyDown_) {
			this.hotKeyDown_ = false;
			if (this.dragging_) {
				this.boxDiv_.style.display = "none";
				this.dragging_ = false;
			}
			for (i = 0; i < this.veilDiv_.length; i++) {
				this.veilDiv_[i].style.display = "none";
			}
			if (this.visualEnabled_) {
				this.buttonDiv_.firstChild.style.left = -(this.visualSize_.width * 2) + "px";
				this.buttonDiv_.title = this.visualTips_.off;
				this.buttonDiv_.style.display = "";
			}

			google.maps.event.trigger(this, "deactivate");
		}
	};

	google.maps.Map.prototype.enableKeyDragZoom = function(opt_zoomOpts) {
		this.dragZoom_ = new DragZoom(this, opt_zoomOpts);
	};
	/**
	 * Disables drag zoom.
	 */
	google.maps.Map.prototype.disableKeyDragZoom = function() {
		var i;
		var d = this.dragZoom_;
		if (d) {
			for (i = 0; i < d.listeners_.length; ++i) {
				google.maps.event.removeListener(d.listeners_[i]);
			}
			this.getDiv().removeChild(d.boxDiv_);
			for (i = 0; i < d.veilDiv_.length; i++) {
				this.getDiv().removeChild(d.veilDiv_[i]);
			}
			if (d.visualEnabled_) {
				// Remove the custom control:
				this.controls[d.visualPosition_].removeAt(d.controlIndex_);
			}
			d.prjov_.setMap(null);
			this.dragZoom_ = null;
		}
	};

	google.maps.Map.prototype.keyDragZoomEnabled = function() {
		return this.dragZoom_ !== null;
	};

	google.maps.Map.prototype.getDragZoomObject = function() {
		return this.dragZoom_;
	};
})();