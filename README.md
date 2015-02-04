```
cat  app/**/*.rb \
     app/**/*.erb \
     public/javascripts/autosur/** \
     public/javascripts/pj/** \
     public/javascripts/off/src/*/js/** \
     public/javascripts/clicrdv/*/src/**/*.js \
     public/javascripts/clicrdv/*/src/**/*.css \
     public/javascripts/clicrdv/*/src/**/*.scss \
     public/javascripts/clicrdv/*/src/**/templates/* \
     public/javascripts/clicrdv3/**/src/**/*.js \
     public/javascripts/clicrdv3/**/src/**/*.css \
     public/javascripts/clicrdv3/**/src/**/*.scss \
     public/javascripts/clicrdv3/**/src/**/templates/* \
     public/javascripts/lib/inputex-3.2.0/build/**/*-debug.js \
     lib/** \
     script/** \
     public/stylesheets/** | sed -e 's/\(\t\|\s\|\n\|\r\)\+/ /g'  | tr -s '\r\n' ' ' > source.txt


node run.js source.txt
```
