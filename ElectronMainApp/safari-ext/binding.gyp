{
 "targets": [
   {
     "target_name": "safari_ext_addon",
     "sources": [ "src.mm"],
     "include_dirs" : [
       "<!(node -e \"require('nan')\")",
     ],
     "libraries": [
        "../shared/libshared.a"
      ],
     "xcode_settings": {
       "OTHER_CPLUSPLUSFLAGS": ["-std=c++17", "-stdlib=libc++", "-mmacosx-version-min=10.14"],
       "OTHER_LDFLAGS": ["-framework CoreFoundation -framework SafariServices -framework ServiceManagement -framework StoreKit"]
     }
   }
 ]
}
