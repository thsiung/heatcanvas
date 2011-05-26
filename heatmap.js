/**
 * 
 * Copyright 2010 Sun Ning <classicning@gmail.com>
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 *
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *
 * Unless required by applicable law or agreed to in writing, 
 * software distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions 
 * and limitations under the License. 
 *
 *
 */

/**
 * Heatmap api based on canvas
 *
 */
var HeatMap = function(canvasId, resolution){
    this.canvas = document.getElementById(canvasId);
    if(this.canvas == null){
        return null;
    }
    
    this.resolution = resolution || 1;
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.data = {};
};

HeatMap.prototype.push = function(x, y, data){
    var id = x+":"+y;
    if(this.data[id]){
        this.data[id] = this.data[id] + data;           
    } else {
        this.data[id] = data;
    }
};

HeatMap.prototype.render = function(step, f_value_color){
    step = step || 1;

    var self = this;
    var worker = new Worker('heatmap-calc.js');
    worker.postMessage({
        'data': self.data,
        'resolution': self.resolution,
        'width': self.width,
        'height': self.height,
        'step': step
    });
    worker.onmessage = function(e){
        self.value = e.data.value;
        self._render(f_value_color);
    }
};


HeatMap.prototype._render = function(f_value_color){
    f_value_color = f_value_color || HeatMap.defaultValue2Color;

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);
    
    // reader background as black
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, this.width, this.height);
    
    // maximum 
    var maxValue = 0;
    for(var id in this.value){
        maxValue = Math.max(this.value[id], maxValue);
    }
    
    for(var pos in this.value){
        var x = parseInt(pos.split(":")[0]);
        var y = parseInt(pos.split(":")[1]);
        
        var color = f_value_color(this.value[pos] / maxValue);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.resolution, this.resolution);
            
        
    }
    
};

HeatMap.prototype.clear = function(){
	this.data = {};
	this.value = {};
	
	this.canvas.getContext("2d").clearRect(0, 0, this.width, this.height);
};

HeatMap.defaultValue2Color = function(value){
    var hue = (1 - value) * 240;
    var light = value * 60;
    return "hsl("+hue+", 80%, "+light+"%)";
}

