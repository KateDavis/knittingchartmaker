
import logging
import sys

import gtk
import gtk.glade
import chart
import stitch
import yarn

class ChartMakerGUI:
    def __init__(self, filename=None):
        self.title = 'ChartMaker'
        self.version =  '0.3'
        self.website = "http://code.google.com/p/knittingchartmaker/"
        self.authors = ["Iain Kelly", "Joeli Kelly"]
        self.description = "A program for designing knitting charts."
        
        logging.debug("ChartMaker started")
        
        self.savefile = filename
        
        self.gladefile = 'glade/chartmakergui.glade'
        self.widgets = gtk.glade.XML(self.gladefile)
        
        self.widgets.get_widget('main_window').connect('destroy', self.closedown)
        self.setTitle()
        
        signals = {
            'on_new1_activate'                : self.newChartDialog,
            'on_newchart_dialog_response'    : self.newChartResponse,
            'on_open1_activate'                : self.openDialog,
            'on_save1_activate'                : self.save,
            'on_save_as1_activate'            : self.saveAsDialog,
            'on_export1_activate'            : self.exportDialog,
            'on_export_dialog_response'        : self.exportResponse,
            'on_resize1_activate'            : self.resizeDialog,
            'on_resize_dialog_response'        : self.resizeResponse,
            'on_preferences1_activate'        : self.preferencesDialog,
            'on_preferences_dialog_response': self.preferencesResponse,
            'on_about1_activate'            : self.about,
            'on_yarn_combobox_changed'        : self.switchYarn,
            'on_edit_yarn_button_clicked'    : self.editYarnDialog,
            'on_yarn_dialog_response'        : self.editYarnResponse,
            'on_stitch_combobox_changed'    : self.switchStitch,
            'on_stitch_ratio_entry_changed'    : self.setStitchRatio,
            'on_zoom_scale_value_changed'    : self.setZoom,
            'on_quit1_activate'                : self.closedown }
        self.widgets.signal_autoconnect(signals)
        
        # disable non-functioning componenets
        self.widgets.get_widget('preferences1').set_sensitive(False)
        
        # setup chart
        self.chart = chart.DrawableChart(20, 20, yarn.Yarn("Background Colour", "#FFFFFF"))
        self.widgets.get_widget('chart_area').add(self.chart.drawing_area())
        self.chart.refresh()
        
        # setup preview (as single cell chart)
        self.stitch_preview = chart.DrawableChart(1, 1, self.chart.yarn, readOnly=True)
        self.widgets.get_widget('preview_box').add(self.stitch_preview.drawing_area())
        self.stitch_preview.refresh()
        
        # show the gui
        self.widgets.get_widget('main_window').show_all()
        
        # setup dialogs
        self.widgets.get_widget('newchart_dialog').set_deletable(False)
        self.widgets.get_widget('yarn_dialog').set_deletable(False)
        self.widgets.get_widget('preferences_dialog').set_deletable(False)
        self.widgets.get_widget('resize_dialog').set_deletable(False)
        self.widgets.get_widget('export_dialog').set_deletable(False)
        
        filt = gtk.FileFilter()
        filt.add_pattern("*.svg")
        filt.set_name("SVG files (*.svg)")
        self.widgets.get_widget('export_filechooser').add_filter(filt)
        
        # setup yarn list
        self.setYarnList()
        
        # setup stitch list
        stitchesbox = self.widgets.get_widget('stitch_combobox')
        stitchlist = gtk.ListStore(str)
        stitchesbox.set_model(stitchlist)
        for st in stitch.allStitches():
            if st == self.chart.stitch.name:
                stitchlist.insert(0, [st])
            else:
                stitchlist.append([st])
        stitchesbox.set_active(0)
        
        # openDialog file is present
        if self.savefile is not None:
            self.openFile(filename)
            
        
        # rendered image settings
        self.img_sqw = 40
        self.img_sqh = 40
        self.img_sqspace = 1
        self.img_gridcol = gtk.gdk.color_parse('#ccc')
        self.img_bgcol = gtk.gdk.color_parse('#fff')
        self.img_numcol = gtk.gdk.color_parse('#000')
        
        gtk.main()
    
    def closedown(self, widget):
        logging.debug("ChartMaker stopped")
        logging.shutdown()
        gtk.main_quit()
        
    def setTitle(self):
        w = self.widgets.get_widget('main_window')
        title = self.title +' v'+self.version
        if self.savefile is not None:
            title += ': '+self.savefile.split('/')[-1]
        w.set_title(title)
        
    def setStitchRatio(self, widget):
        #logging.debug("changed stitch ratio from %f to %f" % (self.chartgui.sqratio, int(widget.get_value())))
        #self.chartgui.sqratio = widget.get_value()
        #self.chartgui.sqh = int(self.chartgui.sqw * self.chartgui.sqratio)
        #self.chartgui.refresh()
        self.chart.refresh()
        
        
    def setZoom(self, widget):
        #logging.debug("zoomed from %d to %d" % (self.chartgui.sqw, int(widget.get_value())))
        #self.chart.sqw = int(widget.get_value())
        #self.chartgui.sqh = int(self.chartgui.sqw * self.chartgui.sqratio)
        #self.chartgui.refresh()
        self.chart.setStitchSize(int(widget.get_value()))
        self.chart.refresh()
        
    def setYarnList(self):
        logging.debug("reset yarn list")
        yarnsbox = self.widgets.get_widget('yarn_combobox')
        yarnlist = gtk.ListStore(str)
        yarnsbox.set_model(yarnlist)
        
        for yn in self.chart.yarns:
            yarnlist.append([yn])
        yarnlist.append(["New Yarn..."])
        yarnsbox.set_active(0)
        
    def switchYarn(self, widget):
        active = widget.get_active()
        model = widget.get_model()
        if active == len(model)-1:
            logging.debug("switched from yarn \"%s\" to a new yarn" % self.chart.yarn.label)
            y = yarn.Yarn("Colour %d"%active, "#FF0000")
            self.chart.yarns[y.label] = y
            model.insert(active, [y.label])
            widget.set_active(active)
        else:
            logging.debug("switched from \"%s\" to \"%s\"" % (self.chart.yarn.label, model[active][0]))
            self.chart.yarn = self.chart.yarns[model[active][0]]
            self.refreshStitchPreview()
            
    def switchStitch(self, widget):
        active = widget.get_active()
        model = widget.get_model()
        logging.debug("switched from stitch \"%s\" to \"%s\"" % (self.chart.stitch.name, model[active][0]))
        self.chart.stitch = stitch.createStitch(model[active][0], self.chart.yarn)
        self.refreshStitchPreview()
        
    def refreshStitchPreview(self):
        logging.debug("refreshing current stitch preview")
        self.stitch_preview.stitch = self.chart.stitch
        self.stitch_preview.yarn = self.chart.yarn
        self.stitch_preview.setYarn(0, 0, self.chart.yarn)
        self.stitch_preview.setStitch(0, 0, self.chart.stitch)
        self.stitch_preview.refresh()
        
    def editYarnDialog(self, widget=None):
        logging.debug("editing yarn \"%s\"" % self.chart.yarn.label)
        self.widgets.get_widget('yarn_label').set_text(self.chart.yarn.label)
        self.widgets.get_widget('yarn_col').set_current_color(self.chart.yarn.gtkcol)
        self.widgets.get_widget('yarn_dialog').show_all()
    
    def editYarnResponse(self, widget, response):
        self.startBusy()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            lbl = self.widgets.get_widget('yarn_label').get_text()
            self.chart.yarn.setGtkCol(self.widgets.get_widget('yarn_col').get_current_color())
            
            model = self.widgets.get_widget('yarn_combobox').get_model()
            for r in model:
                if r[0] == self.chart.yarn.label:
                    r[0] = lbl
                    self.chart.yarn.label = lbl
                    break
                    
            logging.debug("set label to \"%s\" and colour to %s" % (self.chart.yarn.label,self.chart.yarn.col))
            
            self.chart.refresh() # refresh chart with new colors
            
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
        self.stopBusy()
            
    def preferencesDialog(self, widget):
        # TODO: set current vals
        self.widgets.get_widget('preferences_dialog').show_all()
        
    def preferencesResponse(self, widget, response):
        self.startBusy()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            # TODO: set new values
            pass
        
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
            
        self.stopBusy()
        
    def newChartDialog(self, widget):
        logging.debug("new chart...")
        self.widgets.get_widget('newchart_width_entry').set_value(20)
        self.widgets.get_widget('newchart_height_entry').set_value(20)
        self.widgets.get_widget('newchart_dialog').show_all()
    
    def newChartResponse(self, widget, response):
        self.startBusy()
        if response == gtk.RESPONSE_OK:
            w = int(self.widgets.get_widget('newchart_width_entry').get_value())
            h = int(self.widgets.get_widget('newchart_height_entry').get_value())
            logging.debug("new chart with size %dx%d" % (w,h))
            
            self.chart = chart.DrawableChart(w, h, None)
            self.widgets.get_widget('chart_area').add(self.chart.drawing_area())
            self.yarn = self.chart.yarn
            self.savefile = None
            self.refreshStitchPreview()
            
            self.drawChart()
        
        if widget is not None:
            widget.hide()
        
        self.stopBusy()    
    
    def drawChart(self):
        self.startBusy()
        logging.debug("drawing chart")
        
        self.chart.refresh()
        self.stopBusy()
        
    def resizeDialog(self, widget):
        logging.debug("resizing chart...")
        self.widgets.get_widget('resize_width_entry').set_value(self.chart.w)
        self.widgets.get_widget('resize_height_entry').set_value(self.chart.h)
        self.widgets.get_widget('resize_from_combo').set_active(0)
        self.widgets.get_widget('resize_dialog').show_all()    
    
    def resizeResponse(self, widget, response):
        self.startBusy()
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_APPLY]:
            w = int(self.widgets.get_widget('resize_width_entry').get_value())
            h = int(self.widgets.get_widget('resize_height_entry').get_value())
            f = int(self.widgets.get_widget('resize_from_combo').get_active())
            logging.debug("resizing chart from %dx%d to %dx%d from %s" % (self.chart.w, self.chart.h, w, h, ["TL", "TR", "BR", "BL"][f]))
            self.chart.resize(w, h, f)
            self.drawChart()
        
        if response in [gtk.RESPONSE_OK, gtk.RESPONSE_CANCEL]:
            widget.hide()
        
        self.stopBusy()
    
            
    def openDialog(self, widget):
        logging.debug("opening...")
        f = gtk.FileChooserDialog('Open...', self.widgets.get_widget('main_window'), gtk.FILE_CHOOSER_ACTION_OPEN, \
                                (gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OK, gtk.RESPONSE_OK))
        filt = gtk.FileFilter()
        filt.add_pattern("*.cm")
        filt.set_name("ChartMaker files (*.cm)")
        f.add_filter(filt)
        f.connect('response', self.openResponse)
        f.run()
    
    def openResponse(self, widget, response):
        if response == gtk.RESPONSE_OK:
            name =  widget.get_filename()
            if name is not None:
                self.openFile(name)
                
        widget.destroy()
    
    def openFile(self, filename):
        logging.debug("opening file \"%s\"" % filename)
        self.startBusy()
        self.savefile = filename
        
        self.chart.fromKnitML(self.savefile)
        
        self.setYarnList()
        self.drawChart()
        self.setTitle()
        
        self.stopBusy()
    
    def save(self, widget):
        logging.debug("saving...")
        if self.savefile is None:
            self.saveAsDialog(None)
        else:
            self.saveFile()
            
    def saveAsDialog(self, widget):
        logging.debug("save as...")
        f = gtk.FileChooserDialog('Save as...', self.widgets.get_widget('main_window'), gtk.FILE_CHOOSER_ACTION_SAVE, \
                                (gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OK, gtk.RESPONSE_OK))
        
        filt = gtk.FileFilter()
        filt.add_pattern("*.cm")
        filt.set_name("ChartMaker files (*.cm)")
        f.add_filter(filt)
        f.connect('response', self.saveAsResponse)
        f.run()
        
    def saveAsResponse(self, widget, response):
        if response == gtk.RESPONSE_OK:
            self.savefile =  widget.get_filename()
            # HACKY, need better way to save with extension
            if self.savefile.find(".cm") == -1:
                self.savefile += ".cm"
        widget.destroy()
        self.setTitle()
        self.saveFile()
        
    def saveFile(self):
        logging.debug("saving file \"%s\"" % self.savefile)
        self.startBusy()
        
        if self.savefile is not None:
            fp = open(self.savefile, "w")
            self.chart.toKnitML().writexml(fp, "", "\t", "\n")
            fp.close()
            
        self.stopBusy()
        
    def exportDialog(self, widget):
        if self.savefile is None:
            self.saveAsDialog(None)
        
        if self.savefile is not None:
            # TODO: set current vals
            self.widgets.get_widget('export_dialog').show_all()
        
    def exportResponse(self, widget, response):
        self.startBusy()
        if response == gtk.RESPONSE_OK:
            self.startBusy()
            
            exportname = self.widgets.get_widget('export_filechooser').get_filename()
            if exportname.find(".svg") == -1:
                exportname += ".svg"
            
            numbers = ""            
            if self.widgets.get_widget('column_numbers_check').get_active():
                numbers += "b"
                
            # 0 = None, 1 = Left, 2 = Right, 3 = LR, 4 = RL
            a = self.widgets.get_widget('row_numbers_combo').get_active()
            if a == 1:
                numbers += "l"
            elif a == 2:
                numbers += "r"
            elif a == 3:
                numbers += "lr"
            elif a == 4:
                numbers += "rl"
                
            self.chart.toSVG(exportname, self.savefile, numbers, self.img_sqw, self.img_sqh)
            self.stopBusy()
        
        widget.hide()
            
        self.stopBusy()
        
            
    def startBusy(self):
        self.widgets.get_widget('main_window').window.set_cursor(gtk.gdk.Cursor(gtk.gdk.WATCH))
    
    def stopBusy(self):
        self.widgets.get_widget('main_window').window.set_cursor(gtk.gdk.Cursor(gtk.gdk.LEFT_PTR))
        
    def about(self, widget):
        d = gtk.AboutDialog()
        d.set_name(self.title)
        d.set_version(self.version)
        d.set_website(self.website)
        d.set_authors(self.authors)
        d.set_comments(self.description)
        
        d.connect('response', lambda w,r: w.destroy())
        d.run()
        
        
if __name__ == "__main__":
    # setup log
    logfile = "ChartMaker.log"
    logging.basicConfig(filename=logfile, level=logging.DEBUG, format="(%(module)-15s %(funcName)-25s %(lineno)-4d) %(asctime)s: %(levelname)s - %(message)s")
        
    if len(sys.argv) == 2:
        cm = ChartMakerGUI(filename=sys.argv[1])
    else:
        cm = ChartMakerGUI()
