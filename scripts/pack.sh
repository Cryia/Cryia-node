#!/bin/bash
DOWNLOAD_DIR='public/files'
CONFIG_JS='0.b60148a658cac17c7db4.js'

START='(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{Vtdi:function(e,a,i){"use strict";i.r(a);var t=i("6vYr"),o={name:"App"},r=i("F8we"),s=Object(r.a)(o,function(){var e=this.$createElement,a=this._self._c||e;return a("div",{attrs:{id:"app"}},[a("router-view")],1)},[],!1,null,null,null).exports,l=i("Hm8H");t.a.use(l.a);var n=[{path:"/",component:function(){return i.e(3).then(i.bind(null,"1QRf"))},hidden:!0}],d=new l.a({scrollBehavior:function(){return{y:0}},routes:n}),c=i("pf+n");i("Ea8D"),i("PB10"),i("9K9Y"),i("2L/Y"),i("msqW"),i("KtkQ"),i("qKXk");t.a.component("v-echart",c.a),t.a.config.productionTip=!1,new t.a({el:"#app",router:d,render:function(e){return e(s)}})},hG5h:function(e,a){e.exports='
CONFIG=$1
END='}},[["Vtdi",1,2]]]);'

if [ '$CONFIG' = '' ]; then
  echo -n error
fi

FILE_NAME=$(cat /dev/urandom | tr -cd 'A-F0-9' | head -c 16)
TEMP_DIR=${DOWNLOAD_DIR}/${FILE_NAME}

mkdir -p $TEMP_DIR

cp 'public/dist' $TEMP_DIR/www -rf

# Generate new file and replace it. 0.b60148a658cac17c7db4.js 
echo ${START}$(cat $CONFIG)${END} > ${TEMP_DIR}/www/static/js/${CONFIG_JS}

cd ${TEMP_DIR}

# make zipfile
zip -rq -o ${FILE_NAME}.zip www

rm www -rf

# remove public && return
echo -n ${TEMP_DIR#*/}/${FILE_NAME}.zip