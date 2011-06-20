
kcm.Grid = function(canvas_id, cols, rows) {

    /* Attributes */
    this._rows = rows;
    this._cols = cols;
    this._canvas_id = canvas_id;
    this._canvas  = document.getElementById(this._canvas_id);
    this._context = this._canvas.getContext("2d");
    this._square_width  = 30;
    this._square_height = 30;
    this._total_width =  0;
    this._total_height = 0;
    this._colours = {
        background: "#FFFFFF",
        grid: "#000000",
        selected: "#333333"
    };
    this._handlers = {
        cell_click: null,
        cell_selected: null,
        cell_mouse_down: null,
        cell_unselected: null,
        cell_click_selected: null
    };
    this._numbers = {
        "left": false
    };
    this._dragging = false;
    this._selected = {};

    /* private functions */
    this._calculate_total_width = function() {
        this._total_width  = this._square_width  * this._cols;
        this._total_height = this._square_height * this._rows;
        this._canvas.width  = this._total_width+1;
        this._canvas.height = this._total_height+1;
    };
    this._calculate_total_width();

    /* attach handlers using closures to keep scope */
    var self = this;
    this._canvas.onclick = function(event) {
        self._click_handler.call(self, event, false);
    };
    this._canvas.ondblclick = function(event) {
        self._click_handler.call(self, event, true);
    };
    this._canvas.onmousedown = function(event) {
        self._mouse_down_handler.call(self, event);
    };
    this._canvas.onmousemove = function(event) {
        self._mouse_move_handler.call(self, event);
    };
    this._canvas.onmouseup = function(event) {
        self._mouse_up_handler.call(self, event);
    };
    this._click_handler = function(event, double_click) {
        if ( event.ctrlKey || event.shiftKey || event.altKey ) {
            return;
        }
        var pos = this._relative_position(event);
        var grid_pos = this._grid_position(pos.x, pos.y);

        if (   grid_pos.row < 0 || self.rows < grid_pos.row
            || grid_pos.col < 0 || self.cols < grid_pos.col )
        {
            return;
        }

        if (this._selected[grid_pos.col+','+grid_pos.row]) {
            /* if in selection, trigger clicks on all cells in selection */
            if (this._handlers['cell_click']) {
                for (var pos in this._selected) {
                    pos = pos.split(',');
                    this._handlers['cell_click'].fn.call(
                        this._handlers["cell_click"].ctxt,
                        parseInt(pos[0]), parseInt(pos[1]),
                        double_click
                    );
                }
            }
        } else {
            if (this._handlers['cell_click']) {
                this._handlers['cell_click'].fn.call(
                    this._handlers["cell_click"].ctxt,
                    grid_pos.col, grid_pos.row,
                    double_click
                );
            }
        }

        /* unselect everything and run the handlers */ 
        if (this._handlers["cell_unselected"]){
            for (var pos in this._selected) {
                pos = pos.split(',');
                this._handlers['cell_unselected'].fn.call(
                    this._handlers["cell_unselected"].ctxt,
                    parseInt(pos[0]), parseInt(pos[1])
                );
            }
        }
        this._selected = {};
        this.draw();
    };
    this._mouse_down_handler = function(event) {
        var pos = this._relative_position(event);
        var grid_pos = this._grid_position(pos.x, pos.y);

        /* start drag, adding current cell to it */
        if (event.ctrlKey) {
            this._dragging = true;
            this._selected[grid_pos.col+','+grid_pos.row] = 1;
            this.draw();
        }
    };
    this._mouse_move_handler = function(event) {
        if (this._dragging) {
            var pos = this._relative_position(event);
            var grid_pos = this._grid_position(pos.x, pos.y);

            if (this._selected[grid_pos.col+','+grid_pos.row]) {
                return;
            }
            this._selected[grid_pos.col+','+grid_pos.row] = 1;
            this.draw();
        }
    };
    this._mouse_up_handler = function(event) {
        var pos = this._relative_position(event);
        var grid_pos = this._grid_position(pos.x, pos.y);

        this._dragging = false;
    };
    this._relative_position = function(event) {
        var x = 0;
        var y = 0;

        // check for offsets on parents iteratively
        var parent = this._canvas;
        while (parent) {
            x += parent.offsetLeft;
            y += parent.offsetTop;
            parent = parent.offsetParent;
        }

        // TODO: potential style paddings and borders here

        return { x: event.pageX - x, y: event.pageY - y };
    };
    this._grid_position = function(x, y) {
        return {
            col: Math.floor(x / this._square_width),
            row: Math.floor(y / this._square_height)
        };
    };

    /* public getters/setters */
    this.rows = function(new_rows) {
        if (new_rows) {
            this._rows = new_rows;
            this._calculate_total_width();
        }
        return this._rows;
    };
    this.cols = function(new_cols) {
        if (new_cols) {
            this._cols = new_cols;
            this._calculate_total_width();
        }
        return this._cols;
    };
    this.square_width = function(new_width) {
        if (new_width) {
            this._square_width = new_width;
            this._calculate_total_width();
        }
        return this._square_width;
    };
    this.square_height = function(new_height) {
        if (new_height) {
            this._square_height = new_height;
            this._calculate_total_width();
        }
        return this._square_height;
    };
    this.colour = function(type, new_colour) {
        if (new_colour) {
            this._colours[type] = new_colour;
        }
        return this._colours[type];
    };
    this.handler = function(type, fn, ctxt) {
        if (fn) {
            this._handlers[type] = { fn: fn, ctxt: (ctxt ? ctxt : this) };
        }
        return this._handlers[type].fn;
    };

    /* public methods */
    this.draw = function() {

        // draw a clear background
        this._context.fillStyle = this._colours.background;
        this._context.fillRect(0, 0, this._total_width+1, this._total_height+1);

        // add vertical lines
        for (var i=0; i <= this._total_width; i += this._square_width) {
            this._context.beginPath();
            this._context.moveTo(i+0.5 , 0.5);
            this._context.lineTo(i+0.5, this._total_height+0.5);
            this._context.closePath();
            this._context.stroke();
        }

        // add horizontal lines
        for (var i=0; i <= this._total_height; i += this._square_height) {
            this._context.beginPath();
            this._context.moveTo(0.5, i+0.5);
            this._context.lineTo(this._total_width+0.5, i+0.5);
            this._context.closePath();
            this._context.stroke();
        }

        // add border
        this._context.strokeStyle = this._colours.grid;
        this._context.lineWidth = 1;
        //this._context.strokeRect(0, 0, this._total_width+1, this._total_height+1);

        // call draw handler for each cell
        if (this._handlers["cell_draw"]) {
            for (var r=0; r<this._rows; ++r) {
                for (var c=0; c<this._cols; ++c) {
                    this._handlers["cell_draw"].fn.call(
                        this._handlers["cell_draw"].ctxt,
                        this._context,
                        c, r,
                        (c*this._square_width)+1, (r*this._square_height)+1,
                        this._square_width-1, this._square_height-1
                    );
                }
            }
        }

        // draw any selection
        this._context.strokeStyle = this._colours.selection;
        this._context.lineWidth = 2;
        for (var pos in this._selected) {
            pos = pos.split(',');
            this._context.strokeRect(
                parseInt(pos[0])*(this._square_width)+1,
                parseInt(pos[1])*(this._square_height)+1,
                this._square_width-1,
                this._square_height-1
            );
        }
    };

    this.image_data = function() {
        return this._canvas.toDataURL();
    };
    this.data = function(data) {
        if (data) {
            this._canvas.load(data);
        } else {
            return this._context.save();
        }
    };
};
