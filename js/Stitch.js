
kcm.Stitch = function(name, yarn, cols, rows) {
	this._name = name;
	this._yarn = yarn;
	this._rows = (rows ? rows : 1);
	this._cols = (cols ? cols : 1);
	
	this.name = function(new_name) {
		if (new_name) {
			this._name = new_name;
		}
		return this._name;
	};
	this.yarn = function(new_yarn) {
		if (new_yarn) {
			this._yarn = new_yarn;
		}
		return this._yarn;
	};
	this.cols = function(new_cols) {
		if (new_cols) {
			this._cols = new_cols;
		}
		return this._cols;
	};
	this.rows = function(new_rows) {
		if (new_rows) {
			this._rows = new_rows;
		}
		return this._rows;
	};
	
	// canvas renders  better if all lines are drawn from the half pixel
	// http://diveintohtml5.org/canvas.html#pixel-madness
	this._fudge_coordinate = function(n) {
		return Math.round(n)+0.5;
	};
	this._draw_background = function(context, c, r, x, y, w, h) {
		context.fillStyle = this._yarn.colour();
		context.fillRect(x, y, w, h);
	};
	
	this.draw = function(context, c, r, x, y, w, h) {
		;
	};
	
	this.to_svg = function(x, y, w, h) {
		return '';
	};
	
	this.variable_width = function() {
		return false;
	};
};

kcm.knit = function(yarn) {
	kcm.Stitch.call(this, "knit", yarn, 1, 1);
	
	/* knit has no symbol, just draw background */
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
	};
	
	this.to_svg = function(x, y, w, h) {
		return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
	};
};

kcm.purl = function(yarn) {
	kcm.Stitch.call(this, "purl", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);

		var cx = this._fudge_coordinate(x+(w/2));
		var cy = this._fudge_coordinate(y+(h/2));
		var r = Math.min (w, h ) / 5;
		
		context.fillStyle = "#000000";
		context.beginPath();
		context.arc(cx, cy, r, 0, 2*Math.PI, false);
		context.closePath();
		context.fill();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var r = Math.min (w, h) / 5;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#000000"/>\n';
		return bg_xml;
	};
};

kcm.k2tog = function(yarn) {
	kcm.Stitch.call(this, "k2tog", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;
		
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(x+bw,   y+h-bh);
		context.lineTo(x+w-bw, y+bh);
		context.moveTo(this._fudge_coordinate(x+(w/2)), this._fudge_coordinate(y+(h/2)));
		context.lineTo(this._fudge_coordinate(x+w-bw),  this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+(x+bw)+','+(y+h-bh)+' L'+(x+w-bw)+','+(y+bh)+' M'+cx+','+cy+' L'+(x+w-bw)+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.k3tog = function(yarn) {
	kcm.Stitch.call(this, "k3tog", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;
		var cx = this._fudge_coordinate(x+(w/2));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(x+bw,   y+h-bh);
		context.lineTo(x+w-bw, y+bh);
		context.moveTo(this._fudge_coordinate(x+(w/2)), this._fudge_coordinate(y+(h/2)));
		context.lineTo(this._fudge_coordinate(x+w-bw),  this._fudge_coordinate(y+h-bh));
		context.moveTo(this._fudge_coordinate(x+(w/2)), this._fudge_coordinate(y+(h/2)));
		context.lineTo(this._fudge_coordinate(x+(w/2)), this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+(x+bw)+','+(y+h-bh)+' L'+(x+w-bw)+','+(y+bh)+' M'+cx+','+cy+' L'+(x+w-bw)+','+(y+h-bh)+' M'+cx+','+cy+' L'+cx+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.sk2p = function(yarn) {
	 kcm.Stitch.call(this, "sk2p", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;
		var cx = this._fudge_coordinate(x+(w/2));
		
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(cx, this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+h-bh));
		context.moveTo(cx, this._fudge_coordinate(y+bh));
		context.lineTo(cx, this._fudge_coordinate(y+h-bh));
		context.moveTo(cx, this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w-bh), this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+cx+','+(y+bh)+' L'+(x+bw)+','+(y+h-bh)+' M'+cx+','+(y+bh)+' L'+cx+','+(y+h-bh)+' M'+cx+','+(y+bh)+' L'+(x+w-bw)+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.sl1 = function(yarn) {
	kcm.Stitch.call(this, "sk2p", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bh = h / 4;
		var cx = this._fudge_coordinate(x+(w/2));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(cx, this._fudge_coordinate(y+bh));
		context.lineTo(cx, this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+cx+','+(y+bh)+' L'+cx+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.yo = function(yarn) {
	kcm.Stitch.call(this, "yo", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var cx = this._fudge_coordinate(x+(w/2));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.fillStyle = "#000000";
		context.beginPath();
		context.arc(cx, cy, Math.min(w,h)/4, 0, 2*Math.PI, false);
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var r = Math.min (w, h) / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#000000" stroke-width="1"/>\n';
		return bg_xml;
	};
};

kcm.m1 = function(yarn) {
	kcm.Stitch.call(this, "m1", yarn, 1, 1);
	 
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;

		context.strokeStyle = "#000000";
		context.beginPath();
		context.moveTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+h-bh));
		context.moveTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+h/2));
		context.moveTo(this._fudge_coordinate(x+w-bw), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+h/2));
		context.moveTo(this._fudge_coordinate(x+w-bw), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w-bw), this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+(x+bw)+','+(y+bh)+' L'+(x+bw)+','+(y+h-bh)+' M'+(x+bw)+','+(y+bh)+' L'+cx+','+cy+' M'+(x+w-bw)+','+(y+bh)+' L'+cx+','+cy+' M'+(x+w-bw)+','+(y+bh)+' L'+(x+w-bw)+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.ssk = function(yarn) {
	kcm.Stitch.call(this, "ssk", yarn, 1, 1);
	
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;
		
		context.fillStyle = "#000000";
		context.beginPath();
		context.moveTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w-bw), this._fudge_coordinate(y+h-bh));
		context.moveTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+h/2));
		context.lineTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+(x+bw)+','+(y+bh)+' L'+(x+w-bw)+','+(y+h-bh)+' M'+cx+','+cy+' L'+(x+bw)+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.ck3dec = function(yarn) {
	kcm.Stitch.call(this, "ck3dec", yarn, 1, 1);
	 
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, w, h);
		
		var bw = w / 4;
		var bh = h / 4;

		context.strokeStyle = "#000000";
		context.beginPath();
		context.moveTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+h-bh));
		context.moveTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+bw), this._fudge_coordinate(y+h-bh));
		context.moveTo(this._fudge_coordinate(x+w/2), this._fudge_coordinate(y+bh));
		context.lineTo(this._fudge_coordinate(x+w-bw), this._fudge_coordinate(y+h-bh));
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+cx+','+(y+bh)+' L'+cx+','+(y+h-bh)+' M'+cx+','+(y+bh)+' L'+(x+bw)+','+(y+h-bh)+' M'+cx+','+(y+bh)+' L'+(x+w-bw)+','+(y+h-bh)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.rt = function(yarn, rows) {
	kcm.Stitch.call(this, "rt", yarn, 2, 1);
	
	// TODO: variable width
	 
	this.draw = function(context, c, r, x, y, w, h) {
		this._draw_background(context, c, r, x, y, (w*2)+1, h);
		
		var cx = this._fudge_coordinate(x+(w/2));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.strokeStyle = "#000000";
		context.beginPath();
		context.moveTo(x, y+h);
		context.lineTo(x+w, y);
		context.moveTo(x, y);
		context.lineTo(cx, cy);
		context.moveTo(x+w, y+h);
		context.lineTo(x+w*2, y);
		context.moveTo(cx+w, cy);
		context.lineTo(x+w*2, y+h);
		context.closePath();
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var cx = x + ( w / 2 );
		var cy = y + ( h / 2 );
		var bw = w / 4;
		var bh = h / 4;
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+((w*2)+1)+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+x+','+(y+h)+' L'+(x+w)+','+y+' M'+x+','+y+' L'+cx+','+cy+' M'+(x+w)+','+(y+h)+' L'+(x+w*2)+','+y+' M'+(cx+w)+','+cy+' L'+(x+w*2)+','+(y+h)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
};

kcm.fc = function(yarn, rows) {
	kcm.Stitch.call(this, "fc", yarn, rows, 1);
	
	// TODO: variable width
	 
	this.draw = function(context, c, r, x, y, w, h) {
		var tw = ((w+1)*this.cols())-1;
		this._draw_background(context, c, r, x, y, tw, h);
		
		var cx = this._fudge_coordinate(x+(w*(this.cols()/2)+(this.cols()/2)));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.strokeStyle = "#000000";
		context.beginPath();
		
		// calcuate intersection point of the first crossing of lines
		var i1x = this._fudge_coordinate(x+((cx-x)/2));
		context.moveTo(x, y);
		context.lineTo(cx, y+h);
		context.moveTo(x, y+h);
		context.lineTo(i1x, cy);

		//calcuate intersection point of the second crossing of lines
		var i2x = this._fudge_coordinate(cx+((x+tw-cx)/2));
		context.moveTo(cx, y);
		context.lineTo(x+tw, y+h);
		context.moveTo(i2x, cy);
		context.lineTo(x+tw, y);
		context.closePath();
		
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var tw = ((w+1)*this.cols())-1;
		var cx = x+(w*(this.cols()/2)+(this.cols()/2));
		var cy = y + ( h / 2 );
		var i1x = this._fudge_coordinate(x+((cx-x)/2));
		var i2x = this._fudge_coordinate(cx+((x+tw-cx)/2));
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+tw+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+x+','+y+' L'+cx+','+(y+h)+' M'+x+','+(y+h)+' L'+i1x+','+cy+' M'+cx+','+y+' L'+(x+tw)+','+(y+h)+' M'+i2x+','+cy+' L'+(x+tw)+','+y+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
	
	this.variable_width = function() {
		return true;
	};
};
kcm.fc2 = function(yarn) {
	kcm.fc.call(this, yarn, 2);
};
kcm.fc6 = function(yarn) {
	kcm.fc.call(this, yarn, 6);
};
kcm.fc8 = function(yarn) {
	kcm.fc.call(this, yarn, 8);
};
kcm.fc10 = function(yarn) {
	kcm.fc.call(this, yarn, 10);
};


kcm.bc = function(yarn, rows) {
	kcm.Stitch.call(this, "bc", yarn, rows, 1);
	
	// TODO: variable width
	 
	this.draw = function(context, c, r, x, y, w, h) {
		var tw = ((w+1)*this.cols())-1;
		this._draw_background(context, c, r, x, y, tw, h);
		
		var cx = this._fudge_coordinate(x+(w*(this.cols()/2)+(this.cols()/2)));
		var cy = this._fudge_coordinate(y+(h/2));
		
		context.strokeStyle = "#000000";
		context.beginPath();
		
		// calcuate intersection point of the first crossing of lines
		var i1x = this._fudge_coordinate(x+((cx-x)/2));
		context.moveTo(x, y+h);
		context.lineTo(cx, y);
		context.moveTo(i1x, cy);
		context.lineTo(x, y);

		//calcuate intersection point of the second crossing of lines
		var i2x = this._fudge_coordinate(cx+((x+tw-cx)/2));
		context.moveTo(cx, y+h);
		context.lineTo(x+tw, y);
		context.moveTo(i2x, cy);
		context.lineTo(x+tw, y+h);
		context.closePath();
		
		context.stroke();
	};
	
	this.to_svg = function(x, y, w, h) {
		var tw = ((w+1)*this.cols())-1;
		var cx = x+(w*(this.cols()/2)+(this.cols()/2));
		var cy = y + ( h / 2 );
		var i1x = this._fudge_coordinate(x+((cx-x)/2));
		var i2x = this._fudge_coordinate(cx+((x+tw-cx)/2));
		var bg_xml = '<rect x="'+x+'" y="'+y+'" width="'+tw+'" height="'+h+'" fill="' + this._yarn.colour() + '"/>\n';
		bg_xml += '<path d="M'+x+','+(y+h)+' L'+cx+','+y+' M'+i1x+','+cy+' L'+x+','+y+' M'+cx+','+(y+h)+' L'+(x+tw)+','+y+' M'+i2x+','+cy+' L'+(x+tw)+','+(y+h)+'" stroke="#000000" stroke-width="1"/>';
		return bg_xml;
	};
	
	this.variable_width = function() {
		return true;
	};
};

kcm.BlankStitch = function(yarn) {
	kcm.Stitch.call(this, "blank", yarn, 1, 1);
};