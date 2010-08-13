
import sys
from xml.dom import minidom

# python-libxslt1 pkg
import gtk
import libxml2
import libxslt

import stitch
import yarn


class Chart:
    def __init__(self, w=10, h=10, y=None):
        self.w = w
        self.h = h
        
        self.yarn = y
        if y is None:
            self.yarn = yarn.Yarn("Background Colour")
        self.yarns = { self.yarn.label: self.yarn }
        self.defaultYarn = self.yarn
        
        self.stitch = stitch.knit(self.yarn)
        
        self.setup()
    
    def setup(self):
        self.grid = []
        for i in range(self.h):
            row = []
            for j in range(self.w):
                row.append(stitch.knit(self.yarn))
            self.grid.append(row)
    
    def clear(self):
        for i in range(self.h):
            for j in range(self.w):
                self.grid[i][j] = stitch.knit(self.yarn)
    
    def setYarn(self, x, y, yn):
        yn = self.addYarn(yn)
        self.grid[y][x].setYarn(yn)
        
    def getYarn(self, x, y):
        return self.grid[y][x].getYarn()
        
    def setStitch(self, x, y, st):
        self.grid[y][x] = st.copy()
        
    def getStitch(self, x, y):
        return self.grid[y][x]
        
    def addYarn(self, yarn=None, label=None, switch=False):
        # add any new yarn
        if yarn is not None and not self.yarns.has_key(yarn.label):
            self.yarns[yarn.label] = yarn
        
        # set current yarn
        if switch:
            if label is not None and self.yarns.has_key(label):
                self.yarn = self.yarns[label]
            if yarn is not None and self.yarns.has_key(yarn.label):
                self.yarn = self.yarns[yarn.label]
            
        # return yarn
        if yarn is not None:
            return self.yarns[yarn.label]
        if label is not None:
            return self.yarns[label]
        
    def toKnitML(self):
        knitml = minidom.Document()
        
        pattern = knitml.createElement("pattern")
        pattern.setAttribute("xmlns", "http://www.knitml.com/schema/pattern")
        knitml.appendChild(pattern)
        
        supplies = knitml.createElement("supplies")
        pattern.appendChild(supplies)
        
        yarns = knitml.createElement("yarns")
        supplies.appendChild(yarns)
        for y in self.yarns.values():
            yarn = knitml.createElement("yarn")
            yarn.setAttribute("id", y.label)
            col = knitml.createElement("color")
            col.setAttribute("name", y.col)
            yarn.appendChild(col)
            yarns.appendChild(yarn)
        
        directions = knitml.createElement("directions")
        directions.setAttribute("width", self.w)
        directions.setAttribute("height", self.h)
        pattern.appendChild(directions)
        
        group = knitml.createElement("instruction-group")
        group.setAttribute("id", "cm")
        directions.appendChild(group)
        
        section = knitml.createElement("section")
        group.appendChild(section)
        
        for r in self.grid:
            row = knitml.createElement("row")
            for st in r:
                stitch = knitml.createElement(st.name)
                stitch.setAttribute("yarn-ref", st.yarn.label)
                stitch.appendChild(knitml.createTextNode("1"))
                row.appendChild(stitch)
            section.appendChild(row)
        
        return knitml
    
    def fromKnitML(self, filename):
        knitml = minidom.parse(filename)
        
        # grab all yarns
        yarns = knitml.getElementsByTagName("yarn")
        self.yarns = {}
        for yn in yarns:
            y = yarn.Yarn(yn.getAttribute("id"), yn.getElementsByTagName("color")[0].getAttribute("name"))
            self.yarns[y.label] = y
        
        # set size and setup grid
        directions = knitml.getElementsByTagName("directions")[0]
        self.w = int(directions.getAttribute("width"))
        self.h = int(directions.getAttribute("height"))
        self.setup()
        
        # set all stitches
        rows = knitml.getElementsByTagName("row")
        for y, r in enumerate(rows):
            x = 0
            for st in r.childNodes:
                if st.nodeType != st.TEXT_NODE:
                    self.setYarn(x, y, self.yarns[st.getAttribute("yarn-ref")])
                    self.setStitch(x, y, stitch.createStitch(st.tagName, self.yarns[st.getAttribute("yarn-ref")]))
                    x += 1
        
    def toSVG(self, filename, knitmlfile, numbers="", sqw=40, sqh=40, grid=True):
        sd = libxml2.parseFile("misc/knitml2svg.xsl")
        s = libxslt.parseStylesheetDoc(sd)
        d = libxml2.parseFile(knitmlfile)
        r = s.applyStylesheet(d, {"sqw":"'" + str(sqw) + "'", "sqh":"'" + str(sqh) + "'", "grid":"'" + str(int(grid)) + "'", "numbers":"'%s'" % numbers})
        s.saveResultToFilename(filename, r, 0)
        s.freeStylesheet()
        d.freeDoc()
        r.freeDoc()

        
    # pos 0 top-left
    #     1 top-right
    #     2 bottom-right
    #     3 bottom-right
    def resize(self, w, h, pos):
        if 0 <= pos and pos <= 3 and (w != self.w or h != self.h):
            # copy old grid
            w_old = self.w
            h_old = self.h
            grid = []
            for i in range(h_old):
                row = []
                for j in range(w_old):
                    row.append(self.grid[i][j])
                grid.append(row)
            
            self.w = w
            self.h = h
            self.setup()
    
            if pos == 0:
                i = 0
                while i < h_old and i < self.h:
                    j = 0
                    while j < w_old and j < self.w:
                        self.grid[i][j] = grid[i][j]
                        j += 1
                    i += 1
            elif pos == 1:
                i = 0
                while i < h_old and i < self.h:
                    j = w_old - 1
                    k = self.w - 1
                    while j >= 0 and k >= 0:
                        self.grid[i][k] = grid[i][j]
                        j -= 1
                        k -= 1
                    i += 1
            elif pos == 2:
                i = h_old - 1
                h = self.h - 1
                while i >= 0 and h >= 0:
                    j = w_old - 1
                    k = self.w - 1
                    while j >= 0 and k >= 0:
                        self.grid[h][k] = grid[i][j]
                        j -= 1
                        k -= 1
                    i -= 1
                    h -= 1
            elif pos == 3:
                i = h_old - 1
                h = self.h - 1
                while i >= 0 and h >= 0:
                    j = 0
                    while j < w_old and j < self.w:
                        self.grid[h][j] = grid[i][j]
                        j += 1
                    i -= 1
                    h -= 1
    
    def __str__(self):
        s = ""
        for r in self.grid:
            for st in r:
                s += "%s\t" % st
            s += "\n"
        return s

class DrawableChart(Chart):
    def __init__(self, w=10, h=10, y=None, readOnly=False):
        Chart.__init__(self, w, h, y)
        self.stw = 20
        self.sth = 20
        
        self.tw = w * (self.stw + 1) + 1
        self.th = h * (self.sth + 1) + 1
        
        self.da = gtk.DrawingArea()
        self.da.set_size_request(self.tw, self.th)
        
        self.read_only = readOnly
        
        # Signals used to handle backing pixmap
        self.pixmap = None
        self.da.connect("expose_event", self.expose_event)
        self.da.connect("configure_event", self.configure_event)
        if not self.read_only:
            self.da.connect("button_press_event", self.button_press_event)
        
        self.da.set_events(gtk.gdk.EXPOSURE_MASK | gtk.gdk.BUTTON_PRESS_MASK)
    
    # configure the drawing area, i.e. set up a backing pixmap
    def configure_event(self, widget, event):
        self.refresh()
        return True
    
    # redraw the screen from the backing pixmap
    def expose_event(self, widget, event):
        self.refresh()
        return False
        
    def button_press_event(self, widget, event):
        if event.button == 1:
            x, y = int(event.x / (self.stw + 1)), int(event.y / (self.sth + 1))
            self.setStitch(x, y, self.stitch)
            self.setYarn(x, y, self.yarn)
            self.refresh()
            
        return True
        
    def refresh(self):
        # reset size
        self.da.set_size_request(self.tw, self.th)
        
        # draw stitches
        for i in range(self.h):
            for j in range(self.w):
                st = self.getStitch(j, i)
                st.render_to_drawable(self.da.window, self.da.get_style().black_gc, j * (self.stw + 1) + 1, i * (self.sth + 1) + 1, self.stw, self.sth)
        
        # add vertical lines
        for i in range(0, self.tw, self.stw + 1):
            self.da.window.draw_line(self.da.get_style().black_gc, i, 0, i, self.th)
        
        # add horizontal lines
        for i in range(0, self.th, self.sth + 1):
            self.da.window.draw_line(self.da.get_style().black_gc, 0, i, self.tw, i)
        
        # draw a border
        self.da.window.draw_rectangle(self.da.get_style().black_gc, False, 0, 0, self.tw - 1, self.th - 1)
        
        # redraw the whole thing
        self.da.queue_draw()
        
    def drawing_area(self):
        return self.da
    
    def setStitchSize(self, w, h=None):
        if h is None:
            h = w 
        self.stw = w
        self.sth = h
        
        # adjust size
        self.tw = self.w * (self.stw + 1) + 1
        self.th = self.h * (self.sth + 1) + 1
        
    def resize(self, w, h, pos):
        Chart.resize(self, w, h, pos)
        
        # adjust size
        self.tw = self.w * (self.stw + 1) + 1
        self.th = self.h * (self.sth + 1) + 1
        
if __name__ == "__main__":
    c = DrawableChart(2, 2)
    
    w = gtk.Window()
    w.set_name("Chart")
    w.connect("destroy", lambda w: gtk.main_quit())
    
    vbox = gtk.VBox(False, 0)
    w.add(vbox)
    vbox.add(c.drawing_area())
    
    w.show_all()
    
    c.refresh()
    
    gtk.main()
