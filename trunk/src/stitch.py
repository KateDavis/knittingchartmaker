
import inspect

import stitch

class Stitch:
    def __init__(self, name, yarn=None, cols=1, rows=1):
        self.name = name
        self.yarn = yarn
        self.cols = cols
        self.rows = rows
        self.selected = False
        
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        if self.yarn is not None:
            gc = self.yarn.gc
            if gc is None:
                gc = drawable.new_gc()
                self.yarn.gc = gc
                if self.selected:
                    gc.set_rgb_fg_color(self.yarn.selectioncol)
                else:
                    gc.set_rgb_fg_color(self.yarn.gtkcol)
                self.yarn.gc_col = gc.foreground.to_string()
            elif gc.foreground.to_string() != self.yarn.gc_col:
                if self.selected:
                    gc.set_rgb_fg_color(self.yarn.selectioncol)
                else:
                    gc.set_rgb_fg_color(self.yarn.gtkcol)
                self.yarn.gc_col = gc.foreground.to_string()
                
            drawable.draw_rectangle(gc, True, x, y, w, h)
    
    def __str__(self):
        return "%s (%s)" % (self.name, self.yarn)
    
    def setYarn(self, yn):
        self.yarn = yn
        
    def getYarn(self):
        return self.yarn
    
    def copy(self):
        stitch_type = self.__class__
        return stitch_type(self.yarn)
        
class knit(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "knit", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        
class purl(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "purl", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_arc(stgc, True, x + bw, y + bh, w - 2 * bw, h - 2 * bh, 0, 360 * 64)
        
class sk2p(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "sk2p", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + bw, y + bh, x + w - bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + w / 2, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + bw, y + h - bh)
        
class k2tog(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "k2tog", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + w - bw, y + bh, x + bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + w - bw, y + h - bh)
        
class k3tog(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "k3tog", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + w - bw, y + bh, x + bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + w - bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + w / 2, y + h - bh)
        
class sl1(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "sl1", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + w / 2, y + bh, x + w / 2, y + h - bh)
        
class yo(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "yo", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_arc(stgc, False, x + bw, y + bh, w - 2 * bw, h - 2 * bh, 0, 360 * 64)
        
class m1(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "m1", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + w / 4, y + bh, x + w / 4, y + h - bh)
            drawable.draw_line(stgc, x + w / 4, y + bh, x + w / 2, y + h / 2)
            drawable.draw_line(stgc, x + 3 * w / 4, y + bh, x + w / 2, y + h / 2)
            drawable.draw_line(stgc, x + 3 * w / 4, y + bh, x + 3 * w / 4, y + h - bh)
        
class ssk(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "ssk", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + bw, y + bh, x + w - bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + h / 2, x + bw, y + h - bh)
        
class ck3dec(Stitch):
    def __init__(self, yarn):
        Stitch.__init__(self, "ck3dec", yarn, 1, 1)
    
    def render_to_drawable(self, drawable, stgc, x, y, w, h):
        Stitch.render_to_drawable(self, drawable, stgc, x, y, w, h)
        if self.yarn is not None:
            bw, bh = w / 4, h / 4
            drawable.draw_line(stgc, x + w / 2, y + bh, x + w / 2, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + bh, x + bw, y + h - bh)
            drawable.draw_line(stgc, x + w / 2, y + bh, x + w - bw, y + h - bh)

# get list of all available stitches and add helper functions for creation
stitches = {}
for name, obj in inspect.getmembers(stitch):
    if hasattr(obj, "__bases__") and stitch.Stitch in obj.__bases__:
        stitches[name] = obj
        
def createStitch(symbol, yarn=None):
    return stitches[symbol](yarn)

def allStitches():
    return stitches.keys()
