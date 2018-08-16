export default class DocumentType {
  static getIconName(ext) {
    switch (ext) {
      case "md":
        return "file-markdown";
        break;
      case "doc":
      case "dot":
      case "wbk":
      case "docx":
      case "dotx":
      case "docm":
      case "dotm":
      case "docb":
      case "pages":
        return "file-word";
        break;
      case "ppt":
      case "pot":
      case "pps":
      case "pptx":
      case "pptm":
      case "potx":
      case "potm":
      case "ppam":
      case "ppsx":
      case "ppsm":
      case "sldx":
      case "sldm":
      case "key":
        return "file-ppt";
        break;
      case "xls":
      case "xlt":
      case "xlm":
      case "xlsx":
      case "xlsm":
      case "xltx":
      case "xltm":
      case "xlsb":
      case "xla":
      case "xlam":
      case "xll":
      case "xlw":
      case "csv":
      case "numbers":
        return "file-excel";
        break;
      case "txt":
      case "rtf":
      case "pdf":
      case "xps":
      case "asp":
      case "aspx":
      case "cer":
      case "htm":
      case "html":
      case "js":
      case "json":
      case "jsp":
      case "php":
      case "py":
      case "xhtml":
      case "xml":
      case "c":
      case "class":
      case "cpp":
      case "cs":
      case "h":
      case "java":
      case "sh":
      case "swift":
      case "vb":
        return "file-text";
        break;
      case "zip":
      case "zipx":
      case "tar":
      case "gz":
      case "z":
      case "cab":
      case "rar":
      case "bz2":
      case "lzh":
      case "7z":
      case "img":
      case "iso":
      case "xz":
      case "vhd":
      case "vmdk":
      case "exe":
      case "deb":
      case "arj":
      case "pkg":
      case "bin":
      case "dmg":
      case "apk":
      case "com":
      case "jar":
        return "database";
        break;
      case "aif":
      case "cda":
      case "mid":
      case "midi":
      case "mp3":
      case "m4a":
      case "mpa":
      case "ogg":
      case "wav":
      case "wma":
        return "sound";
        break;
      case "3pg":
      case "3g2":
      case "avi":
      case "flv":
      case "h264":
      case "m4v":
      case "mkv":
      case "mov":
      case "mp4":
      case "mpg":
      case "mpeg":
      case "rm":
      case "swf":
      case "vob":
      case "wmv":
        return "video-camera";
        break;
      case "ase":
      case "art":
      case "bmp":
      case "blp":
      case "cd5":
      case "cit":
      case "cpt":
      case "cr2":
      case "cut":
      case "dds":
      case "dib":
      case "djvu":
      case "egt":
      case "exif":
      case "gif":
      case "gpl":
      case "grf":
      case "icns":
      case "ico":
      case "iff":
      case "jng":
      case "jpeg":
      case "jpg":
      case "jfif":
      case "jp2":
      case "jps":
      case "lbm":
      case "max":
      case "miff":
      case "mng":
      case "msp":
      case "nitf":
      case "ota":
      case "pbm":
      case "pc1":
      case "pc2":
      case "pc3":
      case "pcf":
      case "pcx":
      case "pdn":
      case "pgm":
      case "PI1":
      case "PI2":
      case "PI3":
      case "pict":
      case "pct":
      case "pnm":
      case "pns":
      case "ppm":
      case "psb":
      case "psd":
      case "pdd":
      case "psp":
      case "px":
      case "pxm":
      case "pxr":
      case "qfx":
      case "raw":
      case "rle":
      case "sct":
      case "sgi":
      case "rgb":
      case "int":
      case "bw":
      case "tga":
      case "tiff":
      case "tif":
      case "vtf":
      case "xbm":
      case "xcf":
      case "xpm":
      case "3dv":
      case "amf":
      case "ai":
      case "awg":
      case "cgm":
      case "cdr":
      case "cmx":
      case "dxf":
      case "e2d":
      case "egt":
      case "eps":
      case "fs":
      case "gbr":
      case "odg":
      case "svg":
      case "stl":
      case "vrml":
      case "x3d":
      case "sxd":
      case "v2d":
      case "vnd":
      case "wmf":
      case "emf":
      case "art":
      case "xar":
      case "png":
      case "webp":
      case "jxr":
      case "hdp":
      case "wdp":
      case "cur":
      case "ecw":
      case "iff":
      case "lbm":
      case "liff":
      case "nrrd":
      case "pam":
      case "pcx":
      case "pgf":
      case "sgi":
      case "rgb":
      case "rgba":
      case "bw":
      case "int":
      case "inta":
      case "sid":
      case "ras":
      case "sun":
      case "tga":
        return "picture";
        break;
      default:
        return "file";
    }
  }
}