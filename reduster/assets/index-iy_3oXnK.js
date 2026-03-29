var ip=i=>{throw TypeError(i)};var ar=(i,e,t)=>e.has(i)?ip("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t);function sp(i,e){for(var t=0;t<e.length;t++){const n=e[t];if(typeof n!="string"&&!Array.isArray(n)){for(const s in n)if(s!=="default"&&!(s in i)){const r=Object.getOwnPropertyDescriptor(n,s);r&&Object.defineProperty(i,s,r.get?r:{enumerable:!0,get:()=>n[s]})}}}return Object.freeze(Object.defineProperty(i,Symbol.toStringTag,{value:"Module"}))}(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const xl="176",rp=0,rh=1,op=2,Bu=1,ku=2,ri=3,Ri=0,dn=1,Mt=2,fi=0,Ns=1,Er=2,oh=3,ah=4,ap=5,$i=100,cp=101,lp=102,hp=103,up=104,fp=200,dp=201,pp=202,mp=203,sc=204,rc=205,gp=206,_p=207,vp=208,xp=209,yp=210,Mp=211,Sp=212,Ep=213,Tp=214,oc=0,ac=1,cc=2,Ws=3,lc=4,hc=5,uc=6,fc=7,Hu=0,bp=1,wp=2,wi=0,Cp=1,Ap=2,Rp=3,Gu=4,Pp=5,Dp=6,Ip=7,Vu=300,Xs=301,$s=302,dc=303,pc=304,oa=306,mi=1e3,ji=1001,mc=1002,wn=1003,Lp=1004,jr=1005,Vn=1006,ga=1007,Ki=1008,qn=1009,Wu=1010,Xu=1011,Lr=1012,yl=1013,ts=1014,ci=1015,Qs=1016,Ml=1017,Sl=1018,Ur=1020,$u=35902,qu=1021,Yu=1022,Bn=1023,Nr=1026,Or=1027,ju=1028,El=1029,Ku=1030,Tl=1031,bl=1033,Ao=33776,Ro=33777,Po=33778,Do=33779,gc=35840,_c=35841,vc=35842,xc=35843,yc=36196,Mc=37492,Sc=37496,Ec=37808,Tc=37809,bc=37810,wc=37811,Cc=37812,Ac=37813,Rc=37814,Pc=37815,Dc=37816,Ic=37817,Lc=37818,Uc=37819,Nc=37820,Oc=37821,Io=36492,Fc=36494,zc=36495,Zu=36283,Bc=36284,kc=36285,Hc=36286,Up=3200,Np=3201,Ju=0,Op=1,Ti="",_n="srgb",qs="srgb-linear",Wo="linear",dt="srgb",ls=7680,ch=519,Fp=512,zp=513,Bp=514,Qu=515,kp=516,Hp=517,Gp=518,Vp=519,Gc=35044,lh="300 es",li=2e3,Xo=2001;class er{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let hh=1234567;const Tr=Math.PI/180,Ys=180/Math.PI;function $n(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(qt[i&255]+qt[i>>8&255]+qt[i>>16&255]+qt[i>>24&255]+"-"+qt[e&255]+qt[e>>8&255]+"-"+qt[e>>16&15|64]+qt[e>>24&255]+"-"+qt[t&63|128]+qt[t>>8&255]+"-"+qt[t>>16&255]+qt[t>>24&255]+qt[n&255]+qt[n>>8&255]+qt[n>>16&255]+qt[n>>24&255]).toLowerCase()}function Qe(i,e,t){return Math.max(e,Math.min(t,i))}function wl(i,e){return(i%e+e)%e}function Wp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Xp(i,e,t){return i!==e?(t-i)/(e-i):0}function br(i,e,t){return(1-t)*i+t*e}function $p(i,e,t,n){return br(i,e,1-Math.exp(-t*n))}function qp(i,e=1){return e-Math.abs(wl(i,e*2)-e)}function Yp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function jp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Kp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Zp(i,e){return i+Math.random()*(e-i)}function Jp(i){return i*(.5-Math.random())}function Qp(i){i!==void 0&&(hh=i);let e=hh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function em(i){return i*Tr}function tm(i){return i*Ys}function nm(i){return(i&i-1)===0&&i!==0}function im(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function sm(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function rm(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),f=o((e-n)/2),d=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*h,c*u,c*f,a*l);break;case"YZY":i.set(c*f,a*h,c*u,a*l);break;case"ZXZ":i.set(c*u,c*f,a*h,a*l);break;case"XZX":i.set(a*h,c*g,c*d,a*l);break;case"YXY":i.set(c*d,a*h,c*g,a*l);break;case"ZYZ":i.set(c*g,c*d,a*h,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function zn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const ut={DEG2RAD:Tr,RAD2DEG:Ys,generateUUID:$n,clamp:Qe,euclideanModulo:wl,mapLinear:Wp,inverseLerp:Xp,lerp:br,damp:$p,pingpong:qp,smoothstep:Yp,smootherstep:jp,randInt:Kp,randFloat:Zp,randFloatSpread:Jp,seededRandom:Qp,degToRad:em,radToDeg:tm,isPowerOfTwo:nm,ceilPowerOfTwo:im,floorPowerOfTwo:sm,setQuaternionFromProperEuler:rm,normalize:ht,denormalize:zn};class ee{constructor(e=0,t=0){ee.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class je{constructor(e,t,n,s,r,o,a,c,l){je.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],v=s[0],m=s[3],p=s[6],E=s[1],y=s[4],x=s[7],D=s[2],R=s[5],A=s[8];return r[0]=o*v+a*E+c*D,r[3]=o*m+a*y+c*R,r[6]=o*p+a*x+c*A,r[1]=l*v+h*E+u*D,r[4]=l*m+h*y+u*R,r[7]=l*p+h*x+u*A,r[2]=f*v+d*E+g*D,r[5]=f*m+d*y+g*R,r[8]=f*p+d*x+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=h*o-a*l,f=a*c-h*r,d=l*r-o*c,g=t*u+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=u*v,e[1]=(s*l-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=f*v,e[4]=(h*t-s*c)*v,e[5]=(s*r-a*t)*v,e[6]=d*v,e[7]=(n*c-l*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(_a.makeScale(e,t)),this}rotate(e){return this.premultiply(_a.makeRotation(-e)),this}translate(e,t){return this.premultiply(_a.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const _a=new je;function ef(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function $o(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function om(){const i=$o("canvas");return i.style.display="block",i}const uh={};function Lo(i){i in uh||(uh[i]=!0,console.warn(i))}function am(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function cm(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function lm(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const fh=new je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),dh=new je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hm(){const i={enabled:!0,workingColorSpace:qs,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===dt&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===dt&&(s.r=Os(s.r),s.g=Os(s.g),s.b=Os(s.b))),s},fromWorkingColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},toWorkingColorSpace:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ti?Wo:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[qs]:{primaries:e,whitePoint:n,transfer:Wo,toXYZ:fh,fromXYZ:dh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:_n},outputColorSpaceConfig:{drawingBufferColorSpace:_n}},[_n]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:fh,fromXYZ:dh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:_n}}}),i}const ot=hm();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Os(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let hs;class um{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{hs===void 0&&(hs=$o("canvas")),hs.width=e.width,hs.height=e.height;const s=hs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=hs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=$o("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=di(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(di(t[n]/255)*255):t[n]=di(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let fm=0;class Cl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:fm++}),this.uuid=$n(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(va(s[o].image)):r.push(va(s[o]))}else r=va(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function va(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?um.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let dm=0;class on extends er{constructor(e=on.DEFAULT_IMAGE,t=on.DEFAULT_MAPPING,n=ji,s=ji,r=Vn,o=Ki,a=Bn,c=qn,l=on.DEFAULT_ANISOTROPY,h=Ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dm++}),this.uuid=$n(),this.name="",this.source=new Cl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ee(0,0),this.repeat=new ee(1,1),this.center=new ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isTextureArray=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isTextureArray=e.isTextureArray,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case mi:e.x=e.x-Math.floor(e.x);break;case ji:e.x=e.x<0?0:1;break;case mc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case mi:e.y=e.y-Math.floor(e.y);break;case ji:e.y=e.y<0?0:1;break;case mc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}on.DEFAULT_IMAGE=null;on.DEFAULT_MAPPING=Vu;on.DEFAULT_ANISOTROPY=1;class gt{constructor(e=0,t=0,n=0,s=1){gt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],h=c[4],u=c[8],f=c[1],d=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(l+1)/2,x=(d+1)/2,D=(p+1)/2,R=(h+f)/4,A=(u+v)/4,I=(g+m)/4;return y>x&&y>D?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=R/n,r=A/n):x>D?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=R/s,r=I/s):D<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),n=A/r,s=I/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(u-v)/E,this.z=(f-h)/E,this.w=Math.acos((l+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this.w=Qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this.w=Qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class pm extends er{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth?n.depth:1,this.scissor=new gt(0,0,e,t),this.scissorTest=!1,this.viewport=new gt(0,0,e,t);const s={width:e,height:t,depth:this.depth};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Vn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,multiview:!1},n);const r=new on(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Cl(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Pi extends pm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class tf extends on{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wn,this.minFilter=wn,this.wrapR=ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class mm extends on{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wn,this.minFilter=wn,this.wrapR=ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class tr{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3];const f=r[o+0],d=r[o+1],g=r[o+2],v=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=v;return}if(u!==v||c!==f||l!==d||h!==g){let m=1-a;const p=c*f+l*d+h*g+u*v,E=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const D=Math.sqrt(y),R=Math.atan2(D,p*E);m=Math.sin(m*R)/D,a=Math.sin(a*R)/D}const x=a*E;if(c=c*m+f*x,l=l*m+d*x,h=h*m+g*x,u=u*m+v*x,m===1-a){const D=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=D,l*=D,h*=D,u*=D}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[o],f=r[o+1],d=r[o+2],g=r[o+3];return e[t]=a*g+h*u+c*d-l*f,e[t+1]=c*g+h*f+l*u-a*d,e[t+2]=l*g+h*d+a*f-c*u,e[t+3]=h*g-a*u-c*f-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),u=a(r/2),f=c(n/2),d=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=f*h*u+l*d*g,this._y=l*d*u-f*h*g,this._z=l*h*g+f*d*u,this._w=l*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+l*d*g,this._y=l*d*u-f*h*g,this._z=l*h*g-f*d*u,this._w=l*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-l*d*g,this._y=l*d*u+f*h*g,this._z=l*h*g+f*d*u,this._w=l*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-l*d*g,this._y=l*d*u+f*h*g,this._z=l*h*g-f*d*u,this._w=l*h*u+f*d*g;break;case"YZX":this._x=f*h*u+l*d*g,this._y=l*d*u+f*h*g,this._z=l*h*g-f*d*u,this._w=l*h*u-f*d*g;break;case"XZY":this._x=f*h*u-l*d*g,this._y=l*d*u-f*h*g,this._z=l*h*g+f*d*u,this._w=l*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-c)*d,this._y=(r-l)*d,this._z=(o-s)*d}else if(n>a&&n>u){const d=2*Math.sqrt(1+n-a-u);this._w=(h-c)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+l)/d}else if(a>u){const d=2*Math.sqrt(1+a-n-u);this._w=(r-l)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(c+h)/d}else{const d=2*Math.sqrt(1+u-n-a);this._w=(o-s)/d,this._x=(r+l)/d,this._y=(c+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const d=1-t;return this._w=d*o+t*this._w,this._x=d*n+t*this._x,this._y=d*s+t*this._y,this._z=d*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,a),u=Math.sin((1-t)*h)/l,f=Math.sin(t*h)/l;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,n=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ph.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ph.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=s+c*u+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return xa.copy(this).projectOnVector(e),this.sub(xa)}reflect(e){return this.sub(xa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const xa=new P,ph=new tr;class Vr{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Dn):Dn.fromBufferAttribute(r,o),Dn.applyMatrix4(e.matrixWorld),this.expandByPoint(Dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Kr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Kr.copy(n.boundingBox)),Kr.applyMatrix4(e.matrixWorld),this.union(Kr)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dn),Dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(cr),Zr.subVectors(this.max,cr),us.subVectors(e.a,cr),fs.subVectors(e.b,cr),ds.subVectors(e.c,cr),gi.subVectors(fs,us),_i.subVectors(ds,fs),Oi.subVectors(us,ds);let t=[0,-gi.z,gi.y,0,-_i.z,_i.y,0,-Oi.z,Oi.y,gi.z,0,-gi.x,_i.z,0,-_i.x,Oi.z,0,-Oi.x,-gi.y,gi.x,0,-_i.y,_i.x,0,-Oi.y,Oi.x,0];return!ya(t,us,fs,ds,Zr)||(t=[1,0,0,0,1,0,0,0,1],!ya(t,us,fs,ds,Zr))?!1:(Jr.crossVectors(gi,_i),t=[Jr.x,Jr.y,Jr.z],ya(t,us,fs,ds,Zr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qn=[new P,new P,new P,new P,new P,new P,new P,new P],Dn=new P,Kr=new Vr,us=new P,fs=new P,ds=new P,gi=new P,_i=new P,Oi=new P,cr=new P,Zr=new P,Jr=new P,Fi=new P;function ya(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Fi.fromArray(i,r);const a=s.x*Math.abs(Fi.x)+s.y*Math.abs(Fi.y)+s.z*Math.abs(Fi.z),c=e.dot(Fi),l=t.dot(Fi),h=n.dot(Fi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const gm=new Vr,lr=new P,Ma=new P;class Wr{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):gm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;lr.subVectors(e,this.center);const t=lr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(lr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ma.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(lr.copy(e.center).add(Ma)),this.expandByPoint(lr.copy(e.center).sub(Ma))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ei=new P,Sa=new P,Qr=new P,vi=new P,Ea=new P,eo=new P,Ta=new P;class aa{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,t),ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Sa.copy(e).add(t).multiplyScalar(.5),Qr.copy(t).sub(e).normalize(),vi.copy(this.origin).sub(Sa);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Qr),a=vi.dot(this.direction),c=-vi.dot(Qr),l=vi.lengthSq(),h=Math.abs(1-o*o);let u,f,d,g;if(h>0)if(u=o*c-a,f=o*a-c,g=r*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,d=u*(u+o*f+2*a)+f*(o*u+f+2*c)+l}else f=r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;else f=-r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;else f<=-g?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-c),r),d=-u*u+f*(f+2*c)+l):f<=g?(u=0,f=Math.min(Math.max(-r,-c),r),d=f*(f+2*c)+l):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-c),r),d=-u*u+f*(f+2*c)+l);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Sa).addScaledVector(Qr,f),d}intersectSphere(e,t){ei.subVectors(e.center,this.origin);const n=ei.dot(this.direction),s=ei.dot(ei)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,c=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,c=(e.min.z-f.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,t,n,s,r){Ea.subVectors(t,e),eo.subVectors(n,e),Ta.crossVectors(Ea,eo);let o=this.direction.dot(Ta),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;vi.subVectors(this.origin,e);const c=a*this.direction.dot(eo.crossVectors(vi,eo));if(c<0)return null;const l=a*this.direction.dot(Ea.cross(vi));if(l<0||c+l>o)return null;const h=-a*vi.dot(Ta);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class _t{constructor(e,t,n,s,r,o,a,c,l,h,u,f,d,g,v,m){_t.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,h,u,f,d,g,v,m)}set(e,t,n,s,r,o,a,c,l,h,u,f,d,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new _t().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/ps.setFromMatrixColumn(e,0).length(),r=1/ps.setFromMatrixColumn(e,1).length(),o=1/ps.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=o*h,d=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=d+g*l,t[5]=f-v*l,t[9]=-a*c,t[2]=v-f*l,t[6]=g+d*l,t[10]=o*c}else if(e.order==="YXZ"){const f=c*h,d=c*u,g=l*h,v=l*u;t[0]=f+v*a,t[4]=g*a-d,t[8]=o*l,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=d*a-g,t[6]=v+f*a,t[10]=o*c}else if(e.order==="ZXY"){const f=c*h,d=c*u,g=l*h,v=l*u;t[0]=f-v*a,t[4]=-o*u,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*h,t[9]=v-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const f=o*h,d=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=g*l-d,t[8]=f*l+v,t[1]=c*u,t[5]=v*l+f,t[9]=d*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const f=o*c,d=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=v-f*u,t[8]=g*u+d,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=d*u+g,t[10]=f-v*u}else if(e.order==="XZY"){const f=o*c,d=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=f*u+v,t[5]=o*h,t[9]=d*u-g,t[2]=g*u-d,t[6]=a*h,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_m,e,vm)}lookAt(e,t,n){const s=this.elements;return mn.subVectors(e,t),mn.lengthSq()===0&&(mn.z=1),mn.normalize(),xi.crossVectors(n,mn),xi.lengthSq()===0&&(Math.abs(n.z)===1?mn.x+=1e-4:mn.z+=1e-4,mn.normalize(),xi.crossVectors(n,mn)),xi.normalize(),to.crossVectors(mn,xi),s[0]=xi.x,s[4]=to.x,s[8]=mn.x,s[1]=xi.y,s[5]=to.y,s[9]=mn.y,s[2]=xi.z,s[6]=to.z,s[10]=mn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],v=n[6],m=n[10],p=n[14],E=n[3],y=n[7],x=n[11],D=n[15],R=s[0],A=s[4],I=s[8],T=s[12],M=s[1],L=s[5],V=s[9],G=s[13],j=s[2],U=s[6],F=s[10],W=s[14],N=s[3],oe=s[7],fe=s[11],ve=s[15];return r[0]=o*R+a*M+c*j+l*N,r[4]=o*A+a*L+c*U+l*oe,r[8]=o*I+a*V+c*F+l*fe,r[12]=o*T+a*G+c*W+l*ve,r[1]=h*R+u*M+f*j+d*N,r[5]=h*A+u*L+f*U+d*oe,r[9]=h*I+u*V+f*F+d*fe,r[13]=h*T+u*G+f*W+d*ve,r[2]=g*R+v*M+m*j+p*N,r[6]=g*A+v*L+m*U+p*oe,r[10]=g*I+v*V+m*F+p*fe,r[14]=g*T+v*G+m*W+p*ve,r[3]=E*R+y*M+x*j+D*N,r[7]=E*A+y*L+x*U+D*oe,r[11]=E*I+y*V+x*F+D*fe,r[15]=E*T+y*G+x*W+D*ve,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],u=e[6],f=e[10],d=e[14],g=e[3],v=e[7],m=e[11],p=e[15];return g*(+r*c*u-s*l*u-r*a*f+n*l*f+s*a*d-n*c*d)+v*(+t*c*d-t*l*f+r*o*f-s*o*d+s*l*h-r*c*h)+m*(+t*l*u-t*a*d-r*o*u+n*o*d+r*a*h-n*l*h)+p*(-s*a*h-t*c*u+t*a*f+s*o*u-n*o*f+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=e[9],f=e[10],d=e[11],g=e[12],v=e[13],m=e[14],p=e[15],E=u*m*l-v*f*l+v*c*d-a*m*d-u*c*p+a*f*p,y=g*f*l-h*m*l-g*c*d+o*m*d+h*c*p-o*f*p,x=h*v*l-g*u*l+g*a*d-o*v*d-h*a*p+o*u*p,D=g*u*c-h*v*c-g*a*f+o*v*f+h*a*m-o*u*m,R=t*E+n*y+s*x+r*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=E*A,e[1]=(v*f*r-u*m*r-v*s*d+n*m*d+u*s*p-n*f*p)*A,e[2]=(a*m*r-v*c*r+v*s*l-n*m*l-a*s*p+n*c*p)*A,e[3]=(u*c*r-a*f*r-u*s*l+n*f*l+a*s*d-n*c*d)*A,e[4]=y*A,e[5]=(h*m*r-g*f*r+g*s*d-t*m*d-h*s*p+t*f*p)*A,e[6]=(g*c*r-o*m*r-g*s*l+t*m*l+o*s*p-t*c*p)*A,e[7]=(o*f*r-h*c*r+h*s*l-t*f*l-o*s*d+t*c*d)*A,e[8]=x*A,e[9]=(g*u*r-h*v*r-g*n*d+t*v*d+h*n*p-t*u*p)*A,e[10]=(o*v*r-g*a*r+g*n*l-t*v*l-o*n*p+t*a*p)*A,e[11]=(h*a*r-o*u*r-h*n*l+t*u*l+o*n*d-t*a*d)*A,e[12]=D*A,e[13]=(h*v*s-g*u*s+g*n*f-t*v*f-h*n*m+t*u*m)*A,e[14]=(g*a*s-o*v*s-g*n*c+t*v*c+o*n*m-t*a*m)*A,e[15]=(o*u*s-h*a*s+h*n*c-t*u*c-o*n*f+t*a*f)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,u=a+a,f=r*l,d=r*h,g=r*u,v=o*h,m=o*u,p=a*u,E=c*l,y=c*h,x=c*u,D=n.x,R=n.y,A=n.z;return s[0]=(1-(v+p))*D,s[1]=(d+x)*D,s[2]=(g-y)*D,s[3]=0,s[4]=(d-x)*R,s[5]=(1-(f+p))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+y)*A,s[9]=(m-E)*A,s[10]=(1-(f+v))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=ps.set(s[0],s[1],s[2]).length();const o=ps.set(s[4],s[5],s[6]).length(),a=ps.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],In.copy(this);const l=1/r,h=1/o,u=1/a;return In.elements[0]*=l,In.elements[1]*=l,In.elements[2]*=l,In.elements[4]*=h,In.elements[5]*=h,In.elements[6]*=h,In.elements[8]*=u,In.elements[9]*=u,In.elements[10]*=u,t.setFromRotationMatrix(In),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=li){const c=this.elements,l=2*r/(t-e),h=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s);let d,g;if(a===li)d=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Xo)d=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=d,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=li){const c=this.elements,l=1/(t-e),h=1/(n-s),u=1/(o-r),f=(t+e)*l,d=(n+s)*h;let g,v;if(a===li)g=(o+r)*u,v=-2*u;else if(a===Xo)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-d,c[2]=0,c[6]=0,c[10]=v,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ps=new P,In=new _t,_m=new P(0,0,0),vm=new P(1,1,1),xi=new P,to=new P,mn=new P,mh=new _t,gh=new tr;class Yn{constructor(e=0,t=0,n=0,s=Yn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(Qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Qe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Qe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Qe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return mh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(mh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return gh.setFromEuler(this),this.setFromQuaternion(gh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Yn.DEFAULT_ORDER="XYZ";class Al{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xm=0;const _h=new P,ms=new tr,ti=new _t,no=new P,hr=new P,ym=new P,Mm=new tr,vh=new P(1,0,0),xh=new P(0,1,0),yh=new P(0,0,1),Mh={type:"added"},Sm={type:"removed"},gs={type:"childadded",child:null},ba={type:"childremoved",child:null};class wt extends er{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xm++}),this.uuid=$n(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=wt.DEFAULT_UP.clone();const e=new P,t=new Yn,n=new tr,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new _t},normalMatrix:{value:new je}}),this.matrix=new _t,this.matrixWorld=new _t,this.matrixAutoUpdate=wt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Al,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ms.setFromAxisAngle(e,t),this.quaternion.multiply(ms),this}rotateOnWorldAxis(e,t){return ms.setFromAxisAngle(e,t),this.quaternion.premultiply(ms),this}rotateX(e){return this.rotateOnAxis(vh,e)}rotateY(e){return this.rotateOnAxis(xh,e)}rotateZ(e){return this.rotateOnAxis(yh,e)}translateOnAxis(e,t){return _h.copy(e).applyQuaternion(this.quaternion),this.position.add(_h.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vh,e)}translateY(e){return this.translateOnAxis(xh,e)}translateZ(e){return this.translateOnAxis(yh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ti.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?no.copy(e):no.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),hr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ti.lookAt(hr,no,this.up):ti.lookAt(no,hr,this.up),this.quaternion.setFromRotationMatrix(ti),s&&(ti.extractRotation(s.matrixWorld),ms.setFromRotationMatrix(ti),this.quaternion.premultiply(ms.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Mh),gs.child=e,this.dispatchEvent(gs),gs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sm),ba.child=e,this.dispatchEvent(ba),ba.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(ti),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Mh),gs.child=e,this.dispatchEvent(gs),gs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,e,ym),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,Mm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?{min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}:void 0,boundingSphere:a.boundingSphere?{radius:a.boundingSphere.radius,center:a.boundingSphere.center.toArray()}:void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:this.boundingSphere.center.toArray(),radius:this.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:this.boundingBox.min.toArray(),max:this.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}wt.DEFAULT_UP=new P(0,1,0);wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ln=new P,ni=new P,wa=new P,ii=new P,_s=new P,vs=new P,Sh=new P,Ca=new P,Aa=new P,Ra=new P,Pa=new gt,Da=new gt,Ia=new gt;class Tn{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Ln.subVectors(e,t),s.cross(Ln);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Ln.subVectors(s,t),ni.subVectors(n,t),wa.subVectors(e,t);const o=Ln.dot(Ln),a=Ln.dot(ni),c=Ln.dot(wa),l=ni.dot(ni),h=ni.dot(wa),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(l*c-a*h)*f,g=(o*h-a*c)*f;return r.set(1-d-g,g,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,ii)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,ii.x),c.addScaledVector(o,ii.y),c.addScaledVector(a,ii.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return Pa.setScalar(0),Da.setScalar(0),Ia.setScalar(0),Pa.fromBufferAttribute(e,t),Da.fromBufferAttribute(e,n),Ia.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Pa,r.x),o.addScaledVector(Da,r.y),o.addScaledVector(Ia,r.z),o}static isFrontFacing(e,t,n,s){return Ln.subVectors(n,t),ni.subVectors(e,t),Ln.cross(ni).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Ln.cross(ni).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Tn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Tn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Tn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Tn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Tn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;_s.subVectors(s,n),vs.subVectors(r,n),Ca.subVectors(e,n);const c=_s.dot(Ca),l=vs.dot(Ca);if(c<=0&&l<=0)return t.copy(n);Aa.subVectors(e,s);const h=_s.dot(Aa),u=vs.dot(Aa);if(h>=0&&u<=h)return t.copy(s);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(n).addScaledVector(_s,o);Ra.subVectors(e,r);const d=_s.dot(Ra),g=vs.dot(Ra);if(g>=0&&d<=g)return t.copy(r);const v=d*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(vs,a);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Sh.subVectors(r,s),a=(u-h)/(u-h+(d-g)),t.copy(s).addScaledVector(Sh,a);const p=1/(m+v+f);return o=v*p,a=f*p,t.copy(n).addScaledVector(_s,o).addScaledVector(vs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const nf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},io={h:0,s:0,l:0};function La(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ae{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=_n){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=ot.workingColorSpace){if(e=wl(e,1),t=Qe(t,0,1),n=Qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=La(o,r,e+1/3),this.g=La(o,r,e),this.b=La(o,r,e-1/3)}return ot.toWorkingColorSpace(this,s),this}setStyle(e,t=_n){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=_n){const n=nf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=di(e.r),this.g=di(e.g),this.b=di(e.b),this}copyLinearToSRGB(e){return this.r=Os(e.r),this.g=Os(e.g),this.b=Os(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=_n){return ot.fromWorkingColorSpace(Yt.copy(this),e),Math.round(Qe(Yt.r*255,0,255))*65536+Math.round(Qe(Yt.g*255,0,255))*256+Math.round(Qe(Yt.b*255,0,255))}getHexString(e=_n){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.fromWorkingColorSpace(Yt.copy(this),t);const n=Yt.r,s=Yt.g,r=Yt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=ot.workingColorSpace){return ot.fromWorkingColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=_n){ot.fromWorkingColorSpace(Yt.copy(this),e);const t=Yt.r,n=Yt.g,s=Yt.b;return e!==_n?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(yi),this.setHSL(yi.h+e,yi.s+t,yi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(yi),e.getHSL(io);const n=br(yi.h,io.h,t),s=br(yi.s,io.s,t),r=br(yi.l,io.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Yt=new Ae;Ae.NAMES=nf;let Em=0;class Li extends er{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Em++}),this.uuid=$n(),this.name="",this.type="Material",this.blending=Ns,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=sc,this.blendDst=rc,this.blendEquation=$i,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=Ws,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ch,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ls,this.stencilZFail=ls,this.stencilZPass=ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ns&&(n.blending=this.blending),this.side!==Ri&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==sc&&(n.blendSrc=this.blendSrc),this.blendDst!==rc&&(n.blendDst=this.blendDst),this.blendEquation!==$i&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ws&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ch&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ls&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ls&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ls&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class nt extends Li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yn,this.combine=Hu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const It=new P,so=new ee;let Tm=0;class kn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Tm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Gc,this.updateRanges=[],this.gpuType=ci,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.applyMatrix3(e),this.setXY(t,so.x,so.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Gc&&(e.usage=this.usage),e}}class sf extends kn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class rf extends kn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class et extends kn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let bm=0;const Sn=new _t,Ua=new wt,xs=new P,gn=new Vr,ur=new Vr,Ht=new P;class At extends er{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bm++}),this.uuid=$n(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ef(e)?rf:sf)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new je().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Sn.makeRotationFromQuaternion(e),this.applyMatrix4(Sn),this}rotateX(e){return Sn.makeRotationX(e),this.applyMatrix4(Sn),this}rotateY(e){return Sn.makeRotationY(e),this.applyMatrix4(Sn),this}rotateZ(e){return Sn.makeRotationZ(e),this.applyMatrix4(Sn),this}translate(e,t,n){return Sn.makeTranslation(e,t,n),this.applyMatrix4(Sn),this}scale(e,t,n){return Sn.makeScale(e,t,n),this.applyMatrix4(Sn),this}lookAt(e){return Ua.lookAt(e),Ua.updateMatrix(),this.applyMatrix4(Ua.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xs).negate(),this.translate(xs.x,xs.y,xs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new et(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];gn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ht.addVectors(this.boundingBox.min,gn.min),this.boundingBox.expandByPoint(Ht),Ht.addVectors(this.boundingBox.max,gn.max),this.boundingBox.expandByPoint(Ht)):(this.boundingBox.expandByPoint(gn.min),this.boundingBox.expandByPoint(gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(gn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ur.setFromBufferAttribute(a),this.morphTargetsRelative?(Ht.addVectors(gn.min,ur.min),gn.expandByPoint(Ht),Ht.addVectors(gn.max,ur.max),gn.expandByPoint(Ht)):(gn.expandByPoint(ur.min),gn.expandByPoint(ur.max))}gn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Ht.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ht));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Ht.fromBufferAttribute(a,l),c&&(xs.fromBufferAttribute(e,l),Ht.add(xs)),s=Math.max(s,n.distanceToSquared(Ht))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new kn(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let I=0;I<n.count;I++)a[I]=new P,c[I]=new P;const l=new P,h=new P,u=new P,f=new ee,d=new ee,g=new ee,v=new P,m=new P;function p(I,T,M){l.fromBufferAttribute(n,I),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,M),f.fromBufferAttribute(r,I),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,M),h.sub(l),u.sub(l),d.sub(f),g.sub(f);const L=1/(d.x*g.y-g.x*d.y);isFinite(L)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(L),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(L),a[I].add(v),a[T].add(v),a[M].add(v),c[I].add(m),c[T].add(m),c[M].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let I=0,T=E.length;I<T;++I){const M=E[I],L=M.start,V=M.count;for(let G=L,j=L+V;G<j;G+=3)p(e.getX(G+0),e.getX(G+1),e.getX(G+2))}const y=new P,x=new P,D=new P,R=new P;function A(I){D.fromBufferAttribute(s,I),R.copy(D);const T=a[I];y.copy(T),y.sub(D.multiplyScalar(D.dot(T))).normalize(),x.crossVectors(R,T);const L=x.dot(c[I])<0?-1:1;o.setXYZW(I,y.x,y.y,y.z,L)}for(let I=0,T=E.length;I<T;++I){const M=E[I],L=M.start,V=M.count;for(let G=L,j=L+V;G<j;G+=3)A(e.getX(G+0)),A(e.getX(G+1)),A(e.getX(G+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new kn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const s=new P,r=new P,o=new P,a=new P,c=new P,l=new P,h=new P,u=new P;if(e)for(let f=0,d=e.count;f<d;f+=3){const g=e.getX(f+0),v=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,m),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ht.fromBufferAttribute(e,t),Ht.normalize(),e.setXYZ(t,Ht.x,Ht.y,Ht.z)}toNonIndexed(){function e(a,c){const l=a.array,h=a.itemSize,u=a.normalized,f=new l.constructor(c.length*h);let d=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?d=c[v]*a.data.stride+a.offset:d=c[v]*h;for(let p=0;p<h;p++)f[g++]=l[d++]}return new kn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new At,n=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=e(c,n);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){const f=l[h],d=e(f,n);c.push(d)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const d=l[u];h.push(d.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,h=o.length;l<h;l++){const u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Eh=new _t,zi=new aa,ro=new Wr,Th=new P,oo=new P,ao=new P,co=new P,Na=new P,lo=new P,bh=new P,ho=new P;class H extends wt{constructor(e=new At,t=new nt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){lo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],u=r[c];h!==0&&(Na.fromBufferAttribute(u,e),o?lo.addScaledVector(Na,h):lo.addScaledVector(Na.sub(t),h))}t.add(lo)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ro.copy(n.boundingSphere),ro.applyMatrix4(r),zi.copy(e.ray).recast(e.near),!(ro.containsPoint(zi.origin)===!1&&(zi.intersectSphere(ro,Th)===null||zi.origin.distanceToSquared(Th)>(e.far-e.near)**2))&&(Eh.copy(r).invert(),zi.copy(e.ray).applyMatrix4(Eh),!(n.boundingBox!==null&&zi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=o[m.materialIndex],E=Math.max(m.start,d.start),y=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let x=E,D=y;x<D;x+=3){const R=a.getX(x),A=a.getX(x+1),I=a.getX(x+2);s=uo(this,p,e,n,l,h,u,R,A,I),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,d.start),v=Math.min(a.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const E=a.getX(m),y=a.getX(m+1),x=a.getX(m+2);s=uo(this,o,e,n,l,h,u,E,y,x),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=o[m.materialIndex],E=Math.max(m.start,d.start),y=Math.min(c.count,Math.min(m.start+m.count,d.start+d.count));for(let x=E,D=y;x<D;x+=3){const R=x,A=x+1,I=x+2;s=uo(this,p,e,n,l,h,u,R,A,I),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,d.start),v=Math.min(c.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const E=m,y=m+1,x=m+2;s=uo(this,o,e,n,l,h,u,E,y,x),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function wm(i,e,t,n,s,r,o,a){let c;if(e.side===dn?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===Ri,a),c===null)return null;ho.copy(a),ho.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(ho);return l<t.near||l>t.far?null:{distance:l,point:ho.clone(),object:i}}function uo(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,oo),i.getVertexPosition(c,ao),i.getVertexPosition(l,co);const h=wm(i,e,t,n,oo,ao,co,bh);if(h){const u=new P;Tn.getBarycoord(bh,oo,ao,co,u),s&&(h.uv=Tn.getInterpolatedAttribute(s,a,c,l,u,new ee)),r&&(h.uv1=Tn.getInterpolatedAttribute(r,a,c,l,u,new ee)),o&&(h.normal=Tn.getInterpolatedAttribute(o,a,c,l,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new P,materialIndex:0};Tn.getNormal(oo,ao,co,f.normal),h.face=f,h.barycoord=u}return h}class Fe extends At{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new et(l,3)),this.setAttribute("normal",new et(h,3)),this.setAttribute("uv",new et(u,2));function g(v,m,p,E,y,x,D,R,A,I,T){const M=x/A,L=D/I,V=x/2,G=D/2,j=R/2,U=A+1,F=I+1;let W=0,N=0;const oe=new P;for(let fe=0;fe<F;fe++){const ve=fe*L-G;for(let De=0;De<U;De++){const $e=De*M-V;oe[v]=$e*E,oe[m]=ve*y,oe[p]=j,l.push(oe.x,oe.y,oe.z),oe[v]=0,oe[m]=0,oe[p]=R>0?1:-1,h.push(oe.x,oe.y,oe.z),u.push(De/A),u.push(1-fe/I),W+=1}}for(let fe=0;fe<I;fe++)for(let ve=0;ve<A;ve++){const De=f+ve+U*fe,$e=f+ve+U*(fe+1),Y=f+(ve+1)+U*(fe+1),ce=f+(ve+1)+U*fe;c.push(De,$e,ce),c.push($e,Y,ce),N+=6}a.addGroup(d,N,T),d+=N,f+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fe(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function js(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function nn(i){const e={};for(let t=0;t<i.length;t++){const n=js(i[t]);for(const s in n)e[s]=n[s]}return e}function Cm(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function of(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const af={clone:js,merge:nn};var Am=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Rm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class jn extends Li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Am,this.fragmentShader=Rm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=js(e.uniforms),this.uniformsGroups=Cm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class cf extends wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new _t,this.projectionMatrix=new _t,this.projectionMatrixInverse=new _t,this.coordinateSystem=li}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mi=new P,wh=new ee,Ch=new ee;class un extends cf{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ys*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Tr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ys*2*Math.atan(Math.tan(Tr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z)}getViewSize(e,t){return this.getViewBounds(e,wh,Ch),t.subVectors(Ch,wh)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Tr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ys=-90,Ms=1;class Pm extends wt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new un(ys,Ms,e,t);s.layers=this.layers,this.add(s);const r=new un(ys,Ms,e,t);r.layers=this.layers,this.add(r);const o=new un(ys,Ms,e,t);o.layers=this.layers,this.add(o);const a=new un(ys,Ms,e,t);a.layers=this.layers,this.add(a);const c=new un(ys,Ms,e,t);c.layers=this.layers,this.add(c);const l=new un(ys,Ms,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===li)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Xo)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class lf extends on{constructor(e=[],t=Xs,n,s,r,o,a,c,l,h){super(e,t,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Dm extends Pi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new lf(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Vn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Fe(5,5,5),r=new jn({name:"CubemapFromEquirect",uniforms:js(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:dn,blending:fi});r.uniforms.tEquirect.value=t;const o=new H(s,r),a=t.minFilter;return t.minFilter===Ki&&(t.minFilter=Vn),new Pm(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}class vt extends wt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Im={type:"move"};class Oa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;l.inputState.pinching&&f>d+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=d-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Im)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new vt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Rl{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ae(e),this.density=t}clone(){return new Rl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Lm extends wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yn,this.environmentIntensity=1,this.environmentRotation=new Yn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Um{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Gc,this.updateRanges=[],this.version=0,this.uuid=$n()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$n()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const tn=new P;class qo{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix4(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyNormalMatrix(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.transformDirection(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=zn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new kn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new qo(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class hf extends Li{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ss;const fr=new P,Es=new P,Ts=new P,bs=new ee,dr=new ee,uf=new _t,fo=new P,pr=new P,po=new P,Ah=new ee,Fa=new ee,Rh=new ee;class Nm extends wt{constructor(e=new hf){if(super(),this.isSprite=!0,this.type="Sprite",Ss===void 0){Ss=new At;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Um(t,5);Ss.setIndex([0,1,2,0,2,3]),Ss.setAttribute("position",new qo(n,3,0,!1)),Ss.setAttribute("uv",new qo(n,2,3,!1))}this.geometry=Ss,this.material=e,this.center=new ee(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Es.setFromMatrixScale(this.matrixWorld),uf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ts.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Es.multiplyScalar(-Ts.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;mo(fo.set(-.5,-.5,0),Ts,o,Es,s,r),mo(pr.set(.5,-.5,0),Ts,o,Es,s,r),mo(po.set(.5,.5,0),Ts,o,Es,s,r),Ah.set(0,0),Fa.set(1,0),Rh.set(1,1);let a=e.ray.intersectTriangle(fo,pr,po,!1,fr);if(a===null&&(mo(pr.set(-.5,.5,0),Ts,o,Es,s,r),Fa.set(0,1),a=e.ray.intersectTriangle(fo,po,pr,!1,fr),a===null))return;const c=e.ray.origin.distanceTo(fr);c<e.near||c>e.far||t.push({distance:c,point:fr.clone(),uv:Tn.getInterpolation(fr,fo,pr,po,Ah,Fa,Rh,new ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function mo(i,e,t,n,s,r){bs.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(dr.x=r*bs.x-s*bs.y,dr.y=s*bs.x+r*bs.y):dr.copy(bs),i.copy(e),i.x+=dr.x,i.y+=dr.y,i.applyMatrix4(uf)}const za=new P,Om=new P,Fm=new je;class Gi{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=za.subVectors(n,t).cross(Om.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(za),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Fm.getNormalMatrix(e),s=this.coplanarPoint(za).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Bi=new Wr,go=new P;class Pl{constructor(e=new Gi,t=new Gi,n=new Gi,s=new Gi,r=new Gi,o=new Gi){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=li){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],h=s[5],u=s[6],f=s[7],d=s[8],g=s[9],v=s[10],m=s[11],p=s[12],E=s[13],y=s[14],x=s[15];if(n[0].setComponents(c-r,f-l,m-d,x-p).normalize(),n[1].setComponents(c+r,f+l,m+d,x+p).normalize(),n[2].setComponents(c+o,f+h,m+g,x+E).normalize(),n[3].setComponents(c-o,f-h,m-g,x-E).normalize(),n[4].setComponents(c-a,f-u,m-v,x-y).normalize(),t===li)n[5].setComponents(c+a,f+u,m+v,x+y).normalize();else if(t===Xo)n[5].setComponents(a,u,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476,Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(go.x=s.normal.x>0?e.max.x:e.min.x,go.y=s.normal.y>0?e.max.y:e.min.y,go.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(go)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class ff extends Li{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Yo=new P,jo=new P,Ph=new _t,mr=new aa,_o=new Wr,Ba=new P,Dh=new P;class zm extends wt{constructor(e=new At,t=new ff){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Yo.fromBufferAttribute(t,s-1),jo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Yo.distanceTo(jo);e.setAttribute("lineDistance",new et(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(s),_o.radius+=r,e.ray.intersectsSphere(_o)===!1)return;Ph.copy(s).invert(),mr.copy(e.ray).applyMatrix4(Ph);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=d,m=g-1;v<m;v+=l){const p=h.getX(v),E=h.getX(v+1),y=vo(this,e,mr,c,p,E,v);y&&t.push(y)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(d),p=vo(this,e,mr,c,v,m,g-1);p&&t.push(p)}}else{const d=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let v=d,m=g-1;v<m;v+=l){const p=vo(this,e,mr,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=vo(this,e,mr,c,g-1,d,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function vo(i,e,t,n,s,r,o){const a=i.geometry.attributes.position;if(Yo.fromBufferAttribute(a,s),jo.fromBufferAttribute(a,r),t.distanceSqToSegment(Yo,jo,Ba,Dh)>n)return;Ba.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Ba);if(!(l<e.near||l>e.far))return{distance:l,point:Dh.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}class Vc extends Li{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Ih=new _t,Wc=new aa,xo=new Wr,yo=new P;class Lh extends wt{constructor(e=new At,t=new Vc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),xo.copy(n.boundingSphere),xo.applyMatrix4(s),xo.radius+=r,e.ray.intersectsSphere(xo)===!1)return;Ih.copy(s).invert(),Wc.copy(e.ray).applyMatrix4(Ih);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){const f=Math.max(0,o.start),d=Math.min(l.count,o.start+o.count);for(let g=f,v=d;g<v;g++){const m=l.getX(g);yo.fromBufferAttribute(u,m),Uh(yo,m,c,s,e,t,this)}}else{const f=Math.max(0,o.start),d=Math.min(u.count,o.start+o.count);for(let g=f,v=d;g<v;g++)yo.fromBufferAttribute(u,g),Uh(yo,g,c,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Uh(i,e,t,n,s,r,o){const a=Wc.distanceSqToPoint(i);if(a<t){const c=new P;Wc.closestPointToPoint(i,c),c.applyMatrix4(n);const l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class ns extends on{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class df extends on{constructor(e,t,n=ts,s,r,o,a=wn,c=wn,l,h=Nr){if(h!==Nr&&h!==Or)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super(null,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Cl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ko extends At{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],c=[],l=[],h=t/2,u=Math.PI/2*e,f=t,d=2*u+f,g=n*2+r,v=s+1,m=new P,p=new P;for(let E=0;E<=g;E++){let y=0,x=0,D=0,R=0;if(E<=n){const T=E/n,M=T*Math.PI/2;x=-h-e*Math.cos(M),D=e*Math.sin(M),R=-e*Math.cos(M),y=T*u}else if(E<=n+r){const T=(E-n)/r;x=-h+T*t,D=e,R=0,y=u+T*f}else{const T=(E-n-r)/n,M=T*Math.PI/2;x=h+e*Math.sin(M),D=e*Math.cos(M),R=e*Math.sin(M),y=u+f+T*u}const A=Math.max(0,Math.min(1,y/d));let I=0;E===0?I=.5/s:E===g&&(I=-.5/s);for(let T=0;T<=s;T++){const M=T/s,L=M*Math.PI*2,V=Math.sin(L),G=Math.cos(L);p.x=-D*G,p.y=x,p.z=D*V,a.push(p.x,p.y,p.z),m.set(-D*G,R,D*V),m.normalize(),c.push(m.x,m.y,m.z),l.push(M+I,A)}if(E>0){const T=(E-1)*v;for(let M=0;M<s;M++){const L=T+M,V=T+M+1,G=E*v+M,j=E*v+M+1;o.push(L,V,G),o.push(V,j,G)}}}this.setIndex(o),this.setAttribute("position",new et(a,3)),this.setAttribute("normal",new et(c,3)),this.setAttribute("uv",new et(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ko(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Di extends At{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],c=[],l=new P,h=new ee;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const d=n+u/t*s;l.x=e*Math.cos(d),l.y=e*Math.sin(d),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[f]/e+1)/2,h.y=(o[f+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new et(o,3)),this.setAttribute("normal",new et(a,3)),this.setAttribute("uv",new et(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Di(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Xe extends At{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],f=[],d=[];let g=0;const v=[],m=n/2;let p=0;E(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new et(u,3)),this.setAttribute("normal",new et(f,3)),this.setAttribute("uv",new et(d,2));function E(){const x=new P,D=new P;let R=0;const A=(t-e)/n;for(let I=0;I<=r;I++){const T=[],M=I/r,L=M*(t-e)+e;for(let V=0;V<=s;V++){const G=V/s,j=G*c+a,U=Math.sin(j),F=Math.cos(j);D.x=L*U,D.y=-M*n+m,D.z=L*F,u.push(D.x,D.y,D.z),x.set(U,A,F).normalize(),f.push(x.x,x.y,x.z),d.push(G,1-M),T.push(g++)}v.push(T)}for(let I=0;I<s;I++)for(let T=0;T<r;T++){const M=v[T][I],L=v[T+1][I],V=v[T+1][I+1],G=v[T][I+1];(e>0||T!==0)&&(h.push(M,L,G),R+=3),(t>0||T!==r-1)&&(h.push(L,V,G),R+=3)}l.addGroup(p,R,0),p+=R}function y(x){const D=g,R=new ee,A=new P;let I=0;const T=x===!0?e:t,M=x===!0?1:-1;for(let V=1;V<=s;V++)u.push(0,m*M,0),f.push(0,M,0),d.push(.5,.5),g++;const L=g;for(let V=0;V<=s;V++){const j=V/s*c+a,U=Math.cos(j),F=Math.sin(j);A.x=T*F,A.y=m*M,A.z=T*U,u.push(A.x,A.y,A.z),f.push(0,M,0),R.x=U*.5+.5,R.y=F*.5*M+.5,d.push(R.x,R.y),g++}for(let V=0;V<s;V++){const G=D+V,j=L+V;x===!0?h.push(j,j+1,G):h.push(j+1,j,G),I+=3}l.addGroup(p,I,x===!0?1:2),p+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xe(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ca extends Xe{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new ca(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Dl extends At{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],o=[];a(s),l(n),h(),this.setAttribute("position",new et(r,3)),this.setAttribute("normal",new et(r.slice(),3)),this.setAttribute("uv",new et(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(E){const y=new P,x=new P,D=new P;for(let R=0;R<t.length;R+=3)d(t[R+0],y),d(t[R+1],x),d(t[R+2],D),c(y,x,D,E)}function c(E,y,x,D){const R=D+1,A=[];for(let I=0;I<=R;I++){A[I]=[];const T=E.clone().lerp(x,I/R),M=y.clone().lerp(x,I/R),L=R-I;for(let V=0;V<=L;V++)V===0&&I===R?A[I][V]=T:A[I][V]=T.clone().lerp(M,V/L)}for(let I=0;I<R;I++)for(let T=0;T<2*(R-I)-1;T++){const M=Math.floor(T/2);T%2===0?(f(A[I][M+1]),f(A[I+1][M]),f(A[I][M])):(f(A[I][M+1]),f(A[I+1][M+1]),f(A[I+1][M]))}}function l(E){const y=new P;for(let x=0;x<r.length;x+=3)y.x=r[x+0],y.y=r[x+1],y.z=r[x+2],y.normalize().multiplyScalar(E),r[x+0]=y.x,r[x+1]=y.y,r[x+2]=y.z}function h(){const E=new P;for(let y=0;y<r.length;y+=3){E.x=r[y+0],E.y=r[y+1],E.z=r[y+2];const x=m(E)/2/Math.PI+.5,D=p(E)/Math.PI+.5;o.push(x,1-D)}g(),u()}function u(){for(let E=0;E<o.length;E+=6){const y=o[E+0],x=o[E+2],D=o[E+4],R=Math.max(y,x,D),A=Math.min(y,x,D);R>.9&&A<.1&&(y<.2&&(o[E+0]+=1),x<.2&&(o[E+2]+=1),D<.2&&(o[E+4]+=1))}}function f(E){r.push(E.x,E.y,E.z)}function d(E,y){const x=E*3;y.x=e[x+0],y.y=e[x+1],y.z=e[x+2]}function g(){const E=new P,y=new P,x=new P,D=new P,R=new ee,A=new ee,I=new ee;for(let T=0,M=0;T<r.length;T+=9,M+=6){E.set(r[T+0],r[T+1],r[T+2]),y.set(r[T+3],r[T+4],r[T+5]),x.set(r[T+6],r[T+7],r[T+8]),R.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),I.set(o[M+4],o[M+5]),D.copy(E).add(y).add(x).divideScalar(3);const L=m(D);v(R,M+0,E,L),v(A,M+2,y,L),v(I,M+4,x,L)}}function v(E,y,x,D){D<0&&E.x===1&&(o[y]=E.x-1),x.x===0&&x.z===0&&(o[y]=D/2/Math.PI+.5)}function m(E){return Math.atan2(E.z,-E.x)}function p(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dl(e.vertices,e.indices,e.radius,e.details)}}class Kn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);const h=n[s],f=n[s+1]-h,d=(o-h)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),c=t||(o.isVector2?new ee:new P);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new P,s=[],r=[],o=[],a=new P,c=new _t;for(let d=0;d<=e;d++){const g=d/e;s[d]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let l=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),f<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Qe(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(a,g))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(Qe(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let g=1;g<=e;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],d*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Il extends Kn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new ee){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=c-this.aX,d=l-this.aY;c=f*h-d*u+this.aX,l=f*u+d*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Bm extends Il{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ll(){let i=0,e=0,t=0,n=0;function s(r,o,a,c){i=r,e=a,t=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,u){let f=(o-r)/l-(a-r)/(l+h)+(a-o)/h,d=(a-o)/h-(c-o)/(h+u)+(c-a)/u;f*=h,d*=h,s(o,a,f,d)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const Mo=new P,ka=new Ll,Ha=new Ll,Ga=new Ll;class pf extends Kn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new P){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(Mo.subVectors(s[0],s[1]).add(s[0]),l=Mo);const u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Mo.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Mo),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let g=Math.pow(l.distanceToSquared(u),d),v=Math.pow(u.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(h),d);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),ka.initNonuniformCatmullRom(l.x,u.x,f.x,h.x,g,v,m),Ha.initNonuniformCatmullRom(l.y,u.y,f.y,h.y,g,v,m),Ga.initNonuniformCatmullRom(l.z,u.z,f.z,h.z,g,v,m)}else this.curveType==="catmullrom"&&(ka.initCatmullRom(l.x,u.x,f.x,h.x,this.tension),Ha.initCatmullRom(l.y,u.y,f.y,h.y,this.tension),Ga.initCatmullRom(l.z,u.z,f.z,h.z,this.tension));return n.set(ka.calc(c),Ha.calc(c),Ga.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Nh(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,c=i*a;return(2*t-2*n+r+o)*c+(-3*t+3*n-2*r-o)*a+r*i+t}function km(i,e){const t=1-i;return t*t*e}function Hm(i,e){return 2*(1-i)*i*e}function Gm(i,e){return i*i*e}function wr(i,e,t,n){return km(i,e)+Hm(i,t)+Gm(i,n)}function Vm(i,e){const t=1-i;return t*t*t*e}function Wm(i,e){const t=1-i;return 3*t*t*i*e}function Xm(i,e){return 3*(1-i)*i*i*e}function $m(i,e){return i*i*i*e}function Cr(i,e,t,n,s){return Vm(i,e)+Wm(i,t)+Xm(i,n)+$m(i,s)}class mf extends Kn{constructor(e=new ee,t=new ee,n=new ee,s=new ee){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new ee){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cr(e,s.x,r.x,o.x,a.x),Cr(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class qm extends Kn{constructor(e=new P,t=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new P){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cr(e,s.x,r.x,o.x,a.x),Cr(e,s.y,r.y,o.y,a.y),Cr(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class gf extends Kn{constructor(e=new ee,t=new ee){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ee){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ee){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ym extends Kn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _f extends Kn{constructor(e=new ee,t=new ee,n=new ee){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ee){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(wr(e,s.x,r.x,o.x),wr(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vf extends Kn{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(wr(e,s.x,r.x,o.x),wr(e,s.y,r.y,o.y),wr(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class xf extends Kn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ee){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Nh(a,c.x,l.x,h.x,u.x),Nh(a,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new ee().fromArray(s))}return this}}var Zo=Object.freeze({__proto__:null,ArcCurve:Bm,CatmullRomCurve3:pf,CubicBezierCurve:mf,CubicBezierCurve3:qm,EllipseCurve:Il,LineCurve:gf,LineCurve3:Ym,QuadraticBezierCurve:_f,QuadraticBezierCurve3:vf,SplineCurve:xf});class jm extends Kn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Zo[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){const h=c[l];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new Zo[s.type]().fromJSON(s))}return this}}class Oh extends jm{constructor(e){super(),this.type="Path",this.currentPoint=new ee,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new gf(this.currentPoint.clone(),new ee(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new _f(this.currentPoint.clone(),new ee(e,t),new ee(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){const a=new mf(this.currentPoint.clone(),new ee(e,t),new ee(n,s),new ee(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new xf(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,n,s,r,o,a,c),this}absellipse(e,t,n,s,r,o,a,c){const l=new Il(e,t,n,s,r,o,a,c);if(this.curves.length>0){const u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Fs extends Oh{constructor(e){super(e),this.uuid=$n(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new Oh().fromJSON(s))}return this}}function Km(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=yf(i,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=t0(i,e,r,t)),i.length>80*t){a=1/0,c=1/0;let h=-1/0,u=-1/0;for(let f=t;f<s;f+=t){const d=i[f],g=i[f+1];d<a&&(a=d),g<c&&(c=g),d>h&&(h=d),g>u&&(u=g)}l=Math.max(h-a,u-c),l=l!==0?32767/l:0}return Fr(r,o,t,a,c,l,0),o}function yf(i,e,t,n,s){let r;if(s===f0(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Fh(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Fh(o/n|0,i[o],i[o+1],r);return r&&Ks(r,r.next)&&(Br(r),r=r.next),r}function is(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ks(t,t.next)||Ct(t.prev,t,t.next)===0)){if(Br(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Fr(i,e,t,n,s,r,o){if(!i)return;!o&&r&&o0(i,n,s,r);let a=i;for(;i.prev!==i.next;){const c=i.prev,l=i.next;if(r?Jm(i,n,s,r):Zm(i)){e.push(c.i,i.i,l.i),Br(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=Qm(is(i),e),Fr(i,e,t,n,s,r,2)):o===2&&e0(i,e,t,n,s,r):Fr(is(i),e,t,n,s,r,1);break}}}function Zm(i){const e=i.prev,t=i,n=i.next;if(Ct(e,t,n)>=0)return!1;const s=e.x,r=t.x,o=n.x,a=e.y,c=t.y,l=n.y,h=Math.min(s,r,o),u=Math.min(a,c,l),f=Math.max(s,r,o),d=Math.max(a,c,l);let g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&vr(s,a,r,c,o,l,g.x,g.y)&&Ct(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Jm(i,e,t,n){const s=i.prev,r=i,o=i.next;if(Ct(s,r,o)>=0)return!1;const a=s.x,c=r.x,l=o.x,h=s.y,u=r.y,f=o.y,d=Math.min(a,c,l),g=Math.min(h,u,f),v=Math.max(a,c,l),m=Math.max(h,u,f),p=Xc(d,g,e,t,n),E=Xc(v,m,e,t,n);let y=i.prevZ,x=i.nextZ;for(;y&&y.z>=p&&x&&x.z<=E;){if(y.x>=d&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&vr(a,h,c,u,l,f,y.x,y.y)&&Ct(y.prev,y,y.next)>=0||(y=y.prevZ,x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&vr(a,h,c,u,l,f,x.x,x.y)&&Ct(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;y&&y.z>=p;){if(y.x>=d&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&vr(a,h,c,u,l,f,y.x,y.y)&&Ct(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;x&&x.z<=E;){if(x.x>=d&&x.x<=v&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&vr(a,h,c,u,l,f,x.x,x.y)&&Ct(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Qm(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Ks(n,s)&&Sf(n,t,t.next,s)&&zr(n,s)&&zr(s,n)&&(e.push(n.i,t.i,s.i),Br(t),Br(t.next),t=i=s),t=t.next}while(t!==i);return is(t)}function e0(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&l0(o,a)){let c=Ef(o,a);o=is(o,o.next),c=is(c,c.next),Fr(o,e,t,n,s,r,0),Fr(c,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function t0(i,e,t,n){const s=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*n,c=r<o-1?e[r+1]*n:i.length,l=yf(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(c0(l))}s.sort(n0);for(let r=0;r<s.length;r++)t=i0(s[r],t);return t}function n0(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function i0(i,e){const t=s0(i,e);if(!t)return e;const n=Ef(t,i);return is(n,n.next),is(t,t.next)}function s0(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,o;if(Ks(i,t))return t;do{if(Ks(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,c=o.x,l=o.y;let h=1/0;t=o;do{if(n>=t.x&&t.x>=c&&n!==t.x&&Mf(s<l?n:r,s,c,l,s<l?r:n,s,t.x,t.y)){const u=Math.abs(s-t.y)/(n-t.x);zr(t,i)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&r0(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function r0(i,e){return Ct(i.prev,i,e.prev)<0&&Ct(e.next,i,i.next)<0}function o0(i,e,t,n){let s=i;do s.z===0&&(s.z=Xc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,a0(s)}function a0(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function Xc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function c0(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Mf(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function vr(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&Mf(i,e,t,n,s,r,o,a)}function l0(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!h0(i,e)&&(zr(i,e)&&zr(e,i)&&u0(i,e)&&(Ct(i.prev,i,e.prev)||Ct(i,e.prev,e))||Ks(i,e)&&Ct(i.prev,i,i.next)>0&&Ct(e.prev,e,e.next)>0)}function Ct(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ks(i,e){return i.x===e.x&&i.y===e.y}function Sf(i,e,t,n){const s=Eo(Ct(i,e,t)),r=Eo(Ct(i,e,n)),o=Eo(Ct(t,n,i)),a=Eo(Ct(t,n,e));return!!(s!==r&&o!==a||s===0&&So(i,t,e)||r===0&&So(i,n,e)||o===0&&So(t,i,n)||a===0&&So(t,e,n))}function So(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Eo(i){return i>0?1:i<0?-1:0}function h0(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Sf(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function zr(i,e){return Ct(i.prev,i,i.next)<0?Ct(i,e,i.next)>=0&&Ct(i,i.prev,e)>=0:Ct(i,e,i.prev)<0||Ct(i,i.next,e)<0}function u0(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Ef(i,e){const t=$c(i.i,i.x,i.y),n=$c(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Fh(i,e,t,n){const s=$c(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Br(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function $c(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function f0(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class d0{static triangulate(e,t,n=2){return Km(e,t,n)}}class Ds{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Ds.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];zh(e),Bh(n,e);let o=e.length;t.forEach(zh);for(let c=0;c<t.length;c++)s.push(o),o+=t[c].length,Bh(n,t[c]);const a=d0.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function zh(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Bh(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Ji extends At{constructor(e=new Fs([new ee(.5,.5),new ee(-.5,.5),new ee(-.5,-.5),new ee(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let a=0,c=e.length;a<c;a++){const l=e[a];o(l)}this.setAttribute("position",new et(s,3)),this.setAttribute("uv",new et(r,2)),this.computeVertexNormals();function o(a){const c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:p0;let y,x=!1,D,R,A,I;p&&(y=p.getSpacedPoints(h),x=!0,f=!1,D=p.computeFrenetFrames(h,!1),R=new P,A=new P,I=new P),f||(m=0,d=0,g=0,v=0);const T=a.extractPoints(l);let M=T.shape;const L=T.holes;if(!Ds.isClockWise(M)){M=M.reverse();for(let w=0,de=L.length;w<de;w++){const se=L[w];Ds.isClockWise(se)&&(L[w]=se.reverse())}}function G(w){const se=10000000000000001e-36;let le=w[0];for(let J=1;J<=w.length;J++){const ge=J%w.length,re=w[ge],C=re.x-le.x,S=re.y-le.y,B=C*C+S*S,K=Math.max(Math.abs(re.x),Math.abs(re.y),Math.abs(le.x),Math.abs(le.y)),te=se*K*K;if(B<=te){w.splice(ge,1),J--;continue}le=re}}G(M),L.forEach(G);const j=L.length,U=M;for(let w=0;w<j;w++){const de=L[w];M=M.concat(de)}function F(w,de,se){return de||console.error("THREE.ExtrudeGeometry: vec does not exist"),w.clone().addScaledVector(de,se)}const W=M.length;function N(w,de,se){let le,J,ge;const re=w.x-de.x,C=w.y-de.y,S=se.x-w.x,B=se.y-w.y,K=re*re+C*C,te=re*B-C*S;if(Math.abs(te)>Number.EPSILON){const q=Math.sqrt(K),ne=Math.sqrt(S*S+B*B),Q=de.x-C/q,Te=de.y+re/q,Ne=se.x-B/ne,ae=se.y+S/ne,Se=((Ne-Q)*B-(ae-Te)*S)/(re*B-C*S);le=Q+re*Se-w.x,J=Te+C*Se-w.y;const Oe=le*le+J*J;if(Oe<=2)return new ee(le,J);ge=Math.sqrt(Oe/2)}else{let q=!1;re>Number.EPSILON?S>Number.EPSILON&&(q=!0):re<-Number.EPSILON?S<-Number.EPSILON&&(q=!0):Math.sign(C)===Math.sign(B)&&(q=!0),q?(le=-C,J=re,ge=Math.sqrt(K)):(le=re,J=C,ge=Math.sqrt(K/2))}return new ee(le/ge,J/ge)}const oe=[];for(let w=0,de=U.length,se=de-1,le=w+1;w<de;w++,se++,le++)se===de&&(se=0),le===de&&(le=0),oe[w]=N(U[w],U[se],U[le]);const fe=[];let ve,De=oe.concat();for(let w=0,de=j;w<de;w++){const se=L[w];ve=[];for(let le=0,J=se.length,ge=J-1,re=le+1;le<J;le++,ge++,re++)ge===J&&(ge=0),re===J&&(re=0),ve[le]=N(se[le],se[ge],se[re]);fe.push(ve),De=De.concat(ve)}let $e;if(m===0)$e=Ds.triangulateShape(U,L);else{const w=[],de=[];for(let se=0;se<m;se++){const le=se/m,J=d*Math.cos(le*Math.PI/2),ge=g*Math.sin(le*Math.PI/2)+v;for(let re=0,C=U.length;re<C;re++){const S=F(U[re],oe[re],ge);ze(S.x,S.y,-J),le===0&&w.push(S)}for(let re=0,C=j;re<C;re++){const S=L[re];ve=fe[re];const B=[];for(let K=0,te=S.length;K<te;K++){const q=F(S[K],ve[K],ge);ze(q.x,q.y,-J),le===0&&B.push(q)}le===0&&de.push(B)}}$e=Ds.triangulateShape(w,de)}const Y=$e.length,ce=g+v;for(let w=0;w<W;w++){const de=f?F(M[w],De[w],ce):M[w];x?(A.copy(D.normals[0]).multiplyScalar(de.x),R.copy(D.binormals[0]).multiplyScalar(de.y),I.copy(y[0]).add(A).add(R),ze(I.x,I.y,I.z)):ze(de.x,de.y,0)}for(let w=1;w<=h;w++)for(let de=0;de<W;de++){const se=f?F(M[de],De[de],ce):M[de];x?(A.copy(D.normals[w]).multiplyScalar(se.x),R.copy(D.binormals[w]).multiplyScalar(se.y),I.copy(y[w]).add(A).add(R),ze(I.x,I.y,I.z)):ze(se.x,se.y,u/h*w)}for(let w=m-1;w>=0;w--){const de=w/m,se=d*Math.cos(de*Math.PI/2),le=g*Math.sin(de*Math.PI/2)+v;for(let J=0,ge=U.length;J<ge;J++){const re=F(U[J],oe[J],le);ze(re.x,re.y,u+se)}for(let J=0,ge=L.length;J<ge;J++){const re=L[J];ve=fe[J];for(let C=0,S=re.length;C<S;C++){const B=F(re[C],ve[C],le);x?ze(B.x,B.y+y[h-1].y,y[h-1].x+se):ze(B.x,B.y,u+se)}}}be(),pe();function be(){const w=s.length/3;if(f){let de=0,se=W*de;for(let le=0;le<Y;le++){const J=$e[le];Ue(J[2]+se,J[1]+se,J[0]+se)}de=h+m*2,se=W*de;for(let le=0;le<Y;le++){const J=$e[le];Ue(J[0]+se,J[1]+se,J[2]+se)}}else{for(let de=0;de<Y;de++){const se=$e[de];Ue(se[2],se[1],se[0])}for(let de=0;de<Y;de++){const se=$e[de];Ue(se[0]+W*h,se[1]+W*h,se[2]+W*h)}}n.addGroup(w,s.length/3-w,0)}function pe(){const w=s.length/3;let de=0;Ie(U,de),de+=U.length;for(let se=0,le=L.length;se<le;se++){const J=L[se];Ie(J,de),de+=J.length}n.addGroup(w,s.length/3-w,1)}function Ie(w,de){let se=w.length;for(;--se>=0;){const le=se;let J=se-1;J<0&&(J=w.length-1);for(let ge=0,re=h+m*2;ge<re;ge++){const C=W*ge,S=W*(ge+1),B=de+le+C,K=de+J+C,te=de+J+S,q=de+le+S;He(B,K,te,q)}}}function ze(w,de,se){c.push(w),c.push(de),c.push(se)}function Ue(w,de,se){Je(w),Je(de),Je(se);const le=s.length/3,J=E.generateTopUV(n,s,le-3,le-2,le-1);Le(J[0]),Le(J[1]),Le(J[2])}function He(w,de,se,le){Je(w),Je(de),Je(le),Je(de),Je(se),Je(le);const J=s.length/3,ge=E.generateSideWallUV(n,s,J-6,J-3,J-2,J-1);Le(ge[0]),Le(ge[1]),Le(ge[3]),Le(ge[1]),Le(ge[2]),Le(ge[3])}function Je(w){s.push(c[w*3+0]),s.push(c[w*3+1]),s.push(c[w*3+2])}function Le(w){r.push(w.x),r.push(w.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return m0(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Zo[s.type]().fromJSON(s)),new Ji(n,e.options)}}const p0={generateTopUV:function(i,e,t,n,s){const r=e[t*3],o=e[t*3+1],a=e[n*3],c=e[n*3+1],l=e[s*3],h=e[s*3+1];return[new ee(r,o),new ee(a,c),new ee(l,h)]},generateSideWallUV:function(i,e,t,n,s,r){const o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[n*3],h=e[n*3+1],u=e[n*3+2],f=e[s*3],d=e[s*3+1],g=e[s*3+2],v=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new ee(o,1-c),new ee(l,1-u),new ee(f,1-g),new ee(v,1-p)]:[new ee(a,1-c),new ee(h,1-u),new ee(d,1-g),new ee(m,1-p)]}};function m0(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Ul extends Dl{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ul(e.radius,e.detail)}}class Jo extends At{constructor(e=[new ee(0,-.5),new ee(.5,0),new ee(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=Qe(s,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],h=1/t,u=new P,f=new ee,d=new P,g=new P,v=new P;let m=0,p=0;for(let E=0;E<=e.length-1;E++)switch(E){case 0:m=e[E+1].x-e[E].x,p=e[E+1].y-e[E].y,d.x=p*1,d.y=-m,d.z=p*0,v.copy(d),d.normalize(),c.push(d.x,d.y,d.z);break;case e.length-1:c.push(v.x,v.y,v.z);break;default:m=e[E+1].x-e[E].x,p=e[E+1].y-e[E].y,d.x=p*1,d.y=-m,d.z=p*0,g.copy(d),d.x+=v.x,d.y+=v.y,d.z+=v.z,d.normalize(),c.push(d.x,d.y,d.z),v.copy(g)}for(let E=0;E<=t;E++){const y=n+E*h*s,x=Math.sin(y),D=Math.cos(y);for(let R=0;R<=e.length-1;R++){u.x=e[R].x*x,u.y=e[R].y,u.z=e[R].x*D,o.push(u.x,u.y,u.z),f.x=E/t,f.y=R/(e.length-1),a.push(f.x,f.y);const A=c[3*R+0]*x,I=c[3*R+1],T=c[3*R+0]*D;l.push(A,I,T)}}for(let E=0;E<t;E++)for(let y=0;y<e.length-1;y++){const x=y+E*e.length,D=x,R=x+e.length,A=x+e.length+1,I=x+1;r.push(D,R,I),r.push(A,I,R)}this.setIndex(r),this.setAttribute("position",new et(o,3)),this.setAttribute("uv",new et(a,2)),this.setAttribute("normal",new et(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jo(e.points,e.segments,e.phiStart,e.phiLength)}}class Kt extends At{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,u=e/a,f=t/c,d=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const E=p*f-o;for(let y=0;y<l;y++){const x=y*u-r;g.push(x,-E,0),v.push(0,0,1),m.push(y/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let E=0;E<a;E++){const y=E+l*p,x=E+l*(p+1),D=E+1+l*(p+1),R=E+1+l*p;d.push(y,x,R),d.push(x,D,R)}this.setIndex(d),this.setAttribute("position",new et(g,3)),this.setAttribute("normal",new et(v,3)),this.setAttribute("uv",new et(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Kt(e.width,e.height,e.widthSegments,e.heightSegments)}}class mt extends At{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const h=[],u=new P,f=new P,d=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const E=[],y=p/n;let x=0;p===0&&o===0?x=.5/t:p===n&&c===Math.PI&&(x=-.5/t);for(let D=0;D<=t;D++){const R=D/t;u.x=-e*Math.cos(s+R*r)*Math.sin(o+y*a),u.y=e*Math.cos(o+y*a),u.z=e*Math.sin(s+R*r)*Math.sin(o+y*a),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),m.push(R+x,1-y),E.push(l++)}h.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){const y=h[p][E+1],x=h[p][E],D=h[p+1][E],R=h[p+1][E+1];(p!==0||o>0)&&d.push(y,x,R),(p!==n-1||c<Math.PI)&&d.push(x,D,R)}this.setIndex(d),this.setAttribute("position",new et(g,3)),this.setAttribute("normal",new et(v,3)),this.setAttribute("uv",new et(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class hi extends At{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const o=[],a=[],c=[],l=[],h=new P,u=new P,f=new P;for(let d=0;d<=n;d++)for(let g=0;g<=s;g++){const v=g/s*r,m=d/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(v),u.y=(e+t*Math.cos(m))*Math.sin(v),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(v),h.y=e*Math.sin(v),f.subVectors(u,h).normalize(),c.push(f.x,f.y,f.z),l.push(g/s),l.push(d/n)}for(let d=1;d<=n;d++)for(let g=1;g<=s;g++){const v=(s+1)*d+g-1,m=(s+1)*(d-1)+g-1,p=(s+1)*(d-1)+g,E=(s+1)*d+g;o.push(v,m,E),o.push(m,p,E)}this.setIndex(o),this.setAttribute("position",new et(a,3)),this.setAttribute("normal",new et(c,3)),this.setAttribute("uv",new et(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hi(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Nl extends At{constructor(e=new vf(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new P,c=new P,l=new ee;let h=new P;const u=[],f=[],d=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new et(u,3)),this.setAttribute("normal",new et(f,3)),this.setAttribute("uv",new et(d,2));function v(){for(let y=0;y<t;y++)m(y);m(r===!1?t:0),E(),p()}function m(y){h=e.getPointAt(y/t,h);const x=o.normals[y],D=o.binormals[y];for(let R=0;R<=s;R++){const A=R/s*Math.PI*2,I=Math.sin(A),T=-Math.cos(A);c.x=T*x.x+I*D.x,c.y=T*x.y+I*D.y,c.z=T*x.z+I*D.z,c.normalize(),f.push(c.x,c.y,c.z),a.x=h.x+n*c.x,a.y=h.y+n*c.y,a.z=h.z+n*c.z,u.push(a.x,a.y,a.z)}}function p(){for(let y=1;y<=t;y++)for(let x=1;x<=s;x++){const D=(s+1)*(y-1)+(x-1),R=(s+1)*y+(x-1),A=(s+1)*y+x,I=(s+1)*(y-1)+x;g.push(D,R,I),g.push(R,A,I)}}function E(){for(let y=0;y<=t;y++)for(let x=0;x<=s;x++)l.x=y/t,l.y=x/s,d.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Nl(new Zo[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class ue extends Li{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ju,this.normalScale=new ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class g0 extends Li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Up,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class _0 extends Li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Xr extends wt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class v0 extends Xr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Va=new _t,kh=new P,Hh=new P;class Ol{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ee(512,512),this.mapType=qn,this.map=null,this.mapPass=null,this.matrix=new _t,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Pl,this._frameExtents=new ee(1,1),this._viewportCount=1,this._viewports=[new gt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;kh.setFromMatrixPosition(e.matrixWorld),t.position.copy(kh),Hh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Hh),t.updateMatrixWorld(),Va.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Va),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Va)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class x0 extends Ol{constructor(){super(new un(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Ys*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class y0 extends Xr{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.target=new wt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new x0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Gh=new _t,gr=new P,Wa=new P;class M0 extends Ol{constructor(){super(new un(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ee(4,2),this._viewportCount=6,this._viewports=[new gt(2,1,1,1),new gt(0,1,1,1),new gt(3,1,1,1),new gt(1,1,1,1),new gt(3,0,1,1),new gt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),gr.setFromMatrixPosition(e.matrixWorld),n.position.copy(gr),Wa.copy(n.position),Wa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Wa),n.updateMatrixWorld(),s.makeTranslation(-gr.x,-gr.y,-gr.z),Gh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Gh)}}class An extends Xr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new M0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Fl extends cf{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class S0 extends Ol{constructor(){super(new Fl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Vh extends Xr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.target=new wt,this.shadow=new S0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class E0 extends Xr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class T0 extends un{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class b0{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Wh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Wh();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Wh(){return performance.now()}const Xh=new _t;class la{constructor(e,t,n=0,s=1/0){this.ray=new aa(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Al,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Xh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Xh),this}intersectObject(e,t=!0,n=[]){return qc(e,this,n,t),n.sort($h),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)qc(e[s],this,n,t);return n.sort($h),n}}function $h(i,e){return i.distance-e.distance}function qc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)qc(r[o],e,t,!0)}}function qh(i,e,t,n){const s=w0(n);switch(t){case qu:return i*e;case ju:return i*e/s.components*s.byteLength;case El:return i*e/s.components*s.byteLength;case Ku:return i*e*2/s.components*s.byteLength;case Tl:return i*e*2/s.components*s.byteLength;case Yu:return i*e*3/s.components*s.byteLength;case Bn:return i*e*4/s.components*s.byteLength;case bl:return i*e*4/s.components*s.byteLength;case Ao:case Ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Po:case Do:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case _c:case xc:return Math.max(i,16)*Math.max(e,8)/4;case gc:case vc:return Math.max(i,8)*Math.max(e,8)/2;case yc:case Mc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Sc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ec:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Tc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case bc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case wc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Cc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ac:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Rc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Pc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Dc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ic:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Lc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Uc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Nc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Oc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Io:case Fc:case zc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Zu:case Bc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case kc:case Hc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function w0(i){switch(i){case qn:case Wu:return{byteLength:1,components:1};case Lr:case Xu:case Qs:return{byteLength:2,components:1};case Ml:case Sl:return{byteLength:2,components:4};case ts:case yl:case ci:return{byteLength:4,components:1};case $u:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:xl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=xl);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Tf(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function C0(i){const e=new WeakMap;function t(a,c){const l=a.array,h=a.usage,u=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,h),a.onUploadCallback();let d;if(l instanceof Float32Array)d=i.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=i.SHORT;else if(l instanceof Uint32Array)d=i.UNSIGNED_INT;else if(l instanceof Int32Array)d=i.INT;else if(l instanceof Int8Array)d=i.BYTE;else if(l instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){const h=c.array,u=c.updateRanges;if(i.bindBuffer(l,a),u.length===0)i.bufferSubData(l,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){const g=u[f],v=u[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){const v=u[d];i.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var A0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,R0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,P0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,D0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,I0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,L0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,U0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,N0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,O0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,F0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,z0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,B0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,k0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,H0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,G0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,V0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,W0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,X0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,q0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Y0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,j0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,K0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Z0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,J0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Q0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,eg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,tg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ng=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ig=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sg="gl_FragColor = linearToOutputTexel( gl_FragColor );",rg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,og=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ag=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,cg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,lg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,hg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ug=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,dg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,pg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,mg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,gg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,_g=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,vg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,yg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Mg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Sg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Eg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Tg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,wg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ag=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Dg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ig=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lg=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ug=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ng=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Og=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Fg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,kg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Gg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Wg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$g=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,qg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Kg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Zg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,e_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,t_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,n_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,i_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,s_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,r_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,o_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,a_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,c_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,l_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,h_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,u_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,f_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,d_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,p_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,m_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,g_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,__=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,v_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,x_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,y_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,M_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,S_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,E_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,T_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,b_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,w_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const C_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,A_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,R_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,P_=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,D_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,I_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,L_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,U_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,N_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,O_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,F_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,z_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,B_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,k_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,H_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,G_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,W_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,X_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,q_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Y_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,j_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,K_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Z_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,J_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Q_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ev=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tv=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,nv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,iv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ov=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ze={alphahash_fragment:A0,alphahash_pars_fragment:R0,alphamap_fragment:P0,alphamap_pars_fragment:D0,alphatest_fragment:I0,alphatest_pars_fragment:L0,aomap_fragment:U0,aomap_pars_fragment:N0,batching_pars_vertex:O0,batching_vertex:F0,begin_vertex:z0,beginnormal_vertex:B0,bsdfs:k0,iridescence_fragment:H0,bumpmap_pars_fragment:G0,clipping_planes_fragment:V0,clipping_planes_pars_fragment:W0,clipping_planes_pars_vertex:X0,clipping_planes_vertex:$0,color_fragment:q0,color_pars_fragment:Y0,color_pars_vertex:j0,color_vertex:K0,common:Z0,cube_uv_reflection_fragment:J0,defaultnormal_vertex:Q0,displacementmap_pars_vertex:eg,displacementmap_vertex:tg,emissivemap_fragment:ng,emissivemap_pars_fragment:ig,colorspace_fragment:sg,colorspace_pars_fragment:rg,envmap_fragment:og,envmap_common_pars_fragment:ag,envmap_pars_fragment:cg,envmap_pars_vertex:lg,envmap_physical_pars_fragment:yg,envmap_vertex:hg,fog_vertex:ug,fog_pars_vertex:fg,fog_fragment:dg,fog_pars_fragment:pg,gradientmap_pars_fragment:mg,lightmap_pars_fragment:gg,lights_lambert_fragment:_g,lights_lambert_pars_fragment:vg,lights_pars_begin:xg,lights_toon_fragment:Mg,lights_toon_pars_fragment:Sg,lights_phong_fragment:Eg,lights_phong_pars_fragment:Tg,lights_physical_fragment:bg,lights_physical_pars_fragment:wg,lights_fragment_begin:Cg,lights_fragment_maps:Ag,lights_fragment_end:Rg,logdepthbuf_fragment:Pg,logdepthbuf_pars_fragment:Dg,logdepthbuf_pars_vertex:Ig,logdepthbuf_vertex:Lg,map_fragment:Ug,map_pars_fragment:Ng,map_particle_fragment:Og,map_particle_pars_fragment:Fg,metalnessmap_fragment:zg,metalnessmap_pars_fragment:Bg,morphinstance_vertex:kg,morphcolor_vertex:Hg,morphnormal_vertex:Gg,morphtarget_pars_vertex:Vg,morphtarget_vertex:Wg,normal_fragment_begin:Xg,normal_fragment_maps:$g,normal_pars_fragment:qg,normal_pars_vertex:Yg,normal_vertex:jg,normalmap_pars_fragment:Kg,clearcoat_normal_fragment_begin:Zg,clearcoat_normal_fragment_maps:Jg,clearcoat_pars_fragment:Qg,iridescence_pars_fragment:e_,opaque_fragment:t_,packing:n_,premultiplied_alpha_fragment:i_,project_vertex:s_,dithering_fragment:r_,dithering_pars_fragment:o_,roughnessmap_fragment:a_,roughnessmap_pars_fragment:c_,shadowmap_pars_fragment:l_,shadowmap_pars_vertex:h_,shadowmap_vertex:u_,shadowmask_pars_fragment:f_,skinbase_vertex:d_,skinning_pars_vertex:p_,skinning_vertex:m_,skinnormal_vertex:g_,specularmap_fragment:__,specularmap_pars_fragment:v_,tonemapping_fragment:x_,tonemapping_pars_fragment:y_,transmission_fragment:M_,transmission_pars_fragment:S_,uv_pars_fragment:E_,uv_pars_vertex:T_,uv_vertex:b_,worldpos_vertex:w_,background_vert:C_,background_frag:A_,backgroundCube_vert:R_,backgroundCube_frag:P_,cube_vert:D_,cube_frag:I_,depth_vert:L_,depth_frag:U_,distanceRGBA_vert:N_,distanceRGBA_frag:O_,equirect_vert:F_,equirect_frag:z_,linedashed_vert:B_,linedashed_frag:k_,meshbasic_vert:H_,meshbasic_frag:G_,meshlambert_vert:V_,meshlambert_frag:W_,meshmatcap_vert:X_,meshmatcap_frag:$_,meshnormal_vert:q_,meshnormal_frag:Y_,meshphong_vert:j_,meshphong_frag:K_,meshphysical_vert:Z_,meshphysical_frag:J_,meshtoon_vert:Q_,meshtoon_frag:ev,points_vert:tv,points_frag:nv,shadow_vert:iv,shadow_frag:sv,sprite_vert:rv,sprite_frag:ov},me={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new je}},envmap:{envMap:{value:null},envMapRotation:{value:new je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new je},normalScale:{value:new ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0},uvTransform:{value:new je}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}}},Gn={basic:{uniforms:nn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:nn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:nn([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:nn([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:nn([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:nn([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:nn([me.points,me.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:nn([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:nn([me.common,me.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:nn([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:nn([me.sprite,me.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new je}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distanceRGBA:{uniforms:nn([me.common,me.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distanceRGBA_vert,fragmentShader:Ze.distanceRGBA_frag},shadow:{uniforms:nn([me.lights,me.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};Gn.physical={uniforms:nn([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new je},clearcoatNormalScale:{value:new ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new je},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new je},transmissionSamplerSize:{value:new ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new je},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new je},anisotropyVector:{value:new ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new je}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};const To={r:0,b:0,g:0},ki=new Yn,av=new _t;function cv(i,e,t,n,s,r,o){const a=new Ae(0);let c=r===!0?0:1,l,h,u=null,f=0,d=null;function g(y){let x=y.isScene===!0?y.background:null;return x&&x.isTexture&&(x=(y.backgroundBlurriness>0?t:e).get(x)),x}function v(y){let x=!1;const D=g(y);D===null?p(a,c):D&&D.isColor&&(p(D,1),x=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(y,x){const D=g(x);D&&(D.isCubeTexture||D.mapping===oa)?(h===void 0&&(h=new H(new Fe(1,1,1),new jn({name:"BackgroundCubeMaterial",uniforms:js(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,A,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ki.copy(x.backgroundRotation),ki.x*=-1,ki.y*=-1,ki.z*=-1,D.isCubeTexture&&D.isRenderTargetTexture===!1&&(ki.y*=-1,ki.z*=-1),h.material.uniforms.envMap.value=D,h.material.uniforms.flipEnvMap.value=D.isCubeTexture&&D.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(av.makeRotationFromEuler(ki)),h.material.toneMapped=ot.getTransfer(D.colorSpace)!==dt,(u!==D||f!==D.version||d!==i.toneMapping)&&(h.material.needsUpdate=!0,u=D,f=D.version,d=i.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):D&&D.isTexture&&(l===void 0&&(l=new H(new Kt(2,2),new jn({name:"BackgroundMaterial",uniforms:js(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=D,l.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,l.material.toneMapped=ot.getTransfer(D.colorSpace)!==dt,D.matrixAutoUpdate===!0&&D.updateMatrix(),l.material.uniforms.uvTransform.value.copy(D.matrix),(u!==D||f!==D.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=D,f=D.version,d=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function p(y,x){y.getRGB(To,of(i)),n.buffers.color.setClear(To.r,To.g,To.b,x,o)}function E(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,x=1){a.set(y),c=x,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(y){c=y,p(a,c)},render:v,addToRenderList:m,dispose:E}}function lv(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,o=!1;function a(M,L,V,G,j){let U=!1;const F=u(G,V,L);r!==F&&(r=F,l(r.object)),U=d(M,G,V,j),U&&g(M,G,V,j),j!==null&&e.update(j,i.ELEMENT_ARRAY_BUFFER),(U||o)&&(o=!1,x(M,L,V,G),j!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(j).buffer))}function c(){return i.createVertexArray()}function l(M){return i.bindVertexArray(M)}function h(M){return i.deleteVertexArray(M)}function u(M,L,V){const G=V.wireframe===!0;let j=n[M.id];j===void 0&&(j={},n[M.id]=j);let U=j[L.id];U===void 0&&(U={},j[L.id]=U);let F=U[G];return F===void 0&&(F=f(c()),U[G]=F),F}function f(M){const L=[],V=[],G=[];for(let j=0;j<t;j++)L[j]=0,V[j]=0,G[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:V,attributeDivisors:G,object:M,attributes:{},index:null}}function d(M,L,V,G){const j=r.attributes,U=L.attributes;let F=0;const W=V.getAttributes();for(const N in W)if(W[N].location>=0){const fe=j[N];let ve=U[N];if(ve===void 0&&(N==="instanceMatrix"&&M.instanceMatrix&&(ve=M.instanceMatrix),N==="instanceColor"&&M.instanceColor&&(ve=M.instanceColor)),fe===void 0||fe.attribute!==ve||ve&&fe.data!==ve.data)return!0;F++}return r.attributesNum!==F||r.index!==G}function g(M,L,V,G){const j={},U=L.attributes;let F=0;const W=V.getAttributes();for(const N in W)if(W[N].location>=0){let fe=U[N];fe===void 0&&(N==="instanceMatrix"&&M.instanceMatrix&&(fe=M.instanceMatrix),N==="instanceColor"&&M.instanceColor&&(fe=M.instanceColor));const ve={};ve.attribute=fe,fe&&fe.data&&(ve.data=fe.data),j[N]=ve,F++}r.attributes=j,r.attributesNum=F,r.index=G}function v(){const M=r.newAttributes;for(let L=0,V=M.length;L<V;L++)M[L]=0}function m(M){p(M,0)}function p(M,L){const V=r.newAttributes,G=r.enabledAttributes,j=r.attributeDivisors;V[M]=1,G[M]===0&&(i.enableVertexAttribArray(M),G[M]=1),j[M]!==L&&(i.vertexAttribDivisor(M,L),j[M]=L)}function E(){const M=r.newAttributes,L=r.enabledAttributes;for(let V=0,G=L.length;V<G;V++)L[V]!==M[V]&&(i.disableVertexAttribArray(V),L[V]=0)}function y(M,L,V,G,j,U,F){F===!0?i.vertexAttribIPointer(M,L,V,j,U):i.vertexAttribPointer(M,L,V,G,j,U)}function x(M,L,V,G){v();const j=G.attributes,U=V.getAttributes(),F=L.defaultAttributeValues;for(const W in U){const N=U[W];if(N.location>=0){let oe=j[W];if(oe===void 0&&(W==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),W==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor)),oe!==void 0){const fe=oe.normalized,ve=oe.itemSize,De=e.get(oe);if(De===void 0)continue;const $e=De.buffer,Y=De.type,ce=De.bytesPerElement,be=Y===i.INT||Y===i.UNSIGNED_INT||oe.gpuType===yl;if(oe.isInterleavedBufferAttribute){const pe=oe.data,Ie=pe.stride,ze=oe.offset;if(pe.isInstancedInterleavedBuffer){for(let Ue=0;Ue<N.locationSize;Ue++)p(N.location+Ue,pe.meshPerAttribute);M.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=pe.meshPerAttribute*pe.count)}else for(let Ue=0;Ue<N.locationSize;Ue++)m(N.location+Ue);i.bindBuffer(i.ARRAY_BUFFER,$e);for(let Ue=0;Ue<N.locationSize;Ue++)y(N.location+Ue,ve/N.locationSize,Y,fe,Ie*ce,(ze+ve/N.locationSize*Ue)*ce,be)}else{if(oe.isInstancedBufferAttribute){for(let pe=0;pe<N.locationSize;pe++)p(N.location+pe,oe.meshPerAttribute);M.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let pe=0;pe<N.locationSize;pe++)m(N.location+pe);i.bindBuffer(i.ARRAY_BUFFER,$e);for(let pe=0;pe<N.locationSize;pe++)y(N.location+pe,ve/N.locationSize,Y,fe,ve*ce,ve/N.locationSize*pe*ce,be)}}else if(F!==void 0){const fe=F[W];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(N.location,fe);break;case 3:i.vertexAttrib3fv(N.location,fe);break;case 4:i.vertexAttrib4fv(N.location,fe);break;default:i.vertexAttrib1fv(N.location,fe)}}}}E()}function D(){I();for(const M in n){const L=n[M];for(const V in L){const G=L[V];for(const j in G)h(G[j].object),delete G[j];delete L[V]}delete n[M]}}function R(M){if(n[M.id]===void 0)return;const L=n[M.id];for(const V in L){const G=L[V];for(const j in G)h(G[j].object),delete G[j];delete L[V]}delete n[M.id]}function A(M){for(const L in n){const V=n[L];if(V[M.id]===void 0)continue;const G=V[M.id];for(const j in G)h(G[j].object),delete G[j];delete V[M.id]}}function I(){T(),o=!0,r!==s&&(r=s,l(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:T,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:E}}function hv(i,e,t){let n;function s(l){n=l}function r(l,h){i.drawArrays(n,l,h),t.update(h,n,1)}function o(l,h,u){u!==0&&(i.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function a(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];t.update(d,n,1)}function c(l,h,u,f){if(u===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<l.length;g++)o(l[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,l,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*f[v];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function uv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==Bn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const I=A===Qs&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==qn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ci&&!I)}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),D=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:y,maxFragmentUniforms:x,vertexTextures:D,maxSamples:R}}function fv(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Gi,a=new je,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||s;return s=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{const E=r?0:n,y=E*4;let x=p.clippingState||null;c.value=x,x=h(g,f,y,d);for(let D=0;D!==y;++D)x[D]=t[D];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=d+v*4,E=f.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,x=d;y!==v;++y,x+=4)o.copy(u[y]).applyMatrix4(E,a),o.normal.toArray(m,x),m[x+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function dv(i){let e=new WeakMap;function t(o,a){return a===dc?o.mapping=Xs:a===pc&&(o.mapping=$s),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===dc||a===pc)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new Dm(c.height);return l.fromEquirectangularTexture(i,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Is=4,Yh=[.125,.215,.35,.446,.526,.582],qi=20,Xa=new Fl,jh=new Ae;let $a=null,qa=0,Ya=0,ja=!1;const Vi=(1+Math.sqrt(5))/2,ws=1/Vi,Kh=[new P(-Vi,ws,0),new P(Vi,ws,0),new P(-ws,0,Vi),new P(ws,0,Vi),new P(0,Vi,-ws),new P(0,Vi,ws),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],pv=new P;class Zh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){const{size:o=256,position:a=pv}=r;$a=this._renderer.getRenderTarget(),qa=this._renderer.getActiveCubeFace(),Ya=this._renderer.getActiveMipmapLevel(),ja=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=eu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget($a,qa,Ya),this._renderer.xr.enabled=ja,e.scissorTest=!1,bo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Xs||e.mapping===$s?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),$a=this._renderer.getRenderTarget(),qa=this._renderer.getActiveCubeFace(),Ya=this._renderer.getActiveMipmapLevel(),ja=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Vn,minFilter:Vn,generateMipmaps:!1,type:Qs,format:Bn,colorSpace:qs,depthBuffer:!1},s=Jh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jh(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=mv(r)),this._blurMaterial=gv(r,e,t)}return s}_compileMaterial(e){const t=new H(this._lodPlanes[0],e);this._renderer.compile(t,Xa)}_sceneToCubeUV(e,t,n,s,r){const c=new un(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(jh),u.toneMapping=wi,u.autoClear=!1;const g=new nt({name:"PMREM.Background",side:dn,depthWrite:!1,depthTest:!1}),v=new H(new Fe,g);let m=!1;const p=e.background;p?p.isColor&&(g.color.copy(p),e.background=null,m=!0):(g.color.copy(jh),m=!0);for(let E=0;E<6;E++){const y=E%3;y===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[E],r.y,r.z)):y===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[E]));const x=this._cubeSize;bo(s,y*x,E>2?x:0,x,x),u.setRenderTarget(s),m&&u.render(v,c),u.render(e,c)}v.geometry.dispose(),v.material.dispose(),u.toneMapping=d,u.autoClear=f,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Xs||e.mapping===$s;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=eu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qh());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new H(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;bo(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,Xa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Kh[(s-r-1)%Kh.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new H(this._lodPlanes[s],l),f=l.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*qi-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):qi;m>qi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${qi}`);const p=[];let E=0;for(let A=0;A<qi;++A){const I=A/v,T=Math.exp(-I*I/2);p.push(T),A===0?E+=T:A<m&&(E+=2*T)}for(let A=0;A<p.length;A++)p[A]=p[A]/E;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-n;const x=this._sizeLods[s],D=3*x*(s>y-Is?s-y+Is:0),R=4*(this._cubeSize-x);bo(t,D,R,3*x,2*x),c.setRenderTarget(t),c.render(u,Xa)}}function mv(i){const e=[],t=[],n=[];let s=i;const r=i-Is+1+Yh.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let c=1/a;o>i-Is?c=Yh[o-i+Is-1]:o===0&&(c=0),n.push(c);const l=1/(a-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,v=3,m=2,p=1,E=new Float32Array(v*g*d),y=new Float32Array(m*g*d),x=new Float32Array(p*g*d);for(let R=0;R<d;R++){const A=R%3*2/3-1,I=R>2?0:-1,T=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];E.set(T,v*g*R),y.set(f,m*g*R);const M=[R,R,R,R,R,R];x.set(M,p*g*R)}const D=new At;D.setAttribute("position",new kn(E,v)),D.setAttribute("uv",new kn(y,m)),D.setAttribute("faceIndex",new kn(x,p)),e.push(D),s>Is&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Jh(i,e,t){const n=new Pi(i,e,t);return n.texture.mapping=oa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function bo(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function gv(i,e,t){const n=new Float32Array(qi),s=new P(0,1,0);return new jn({name:"SphericalGaussianBlur",defines:{n:qi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Qh(){return new jn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function eu(){return new jn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function zl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function _v(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===dc||c===pc,h=c===Xs||c===$s;if(l||h){let u=e.get(a);const f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Zh(i)),u=l?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const d=a.image;return l&&d&&d.height>0||h&&d&&s(d)?(t===null&&(t=new Zh(i)),u=l?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function vv(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Lo("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function xv(i,e,t,n){const s={},r=new WeakMap;function o(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];const d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function c(u){const f=u.attributes;for(const d in f)e.update(f[d],i.ARRAY_BUFFER)}function l(u){const f=[],d=u.index,g=u.attributes.position;let v=0;if(d!==null){const E=d.array;v=d.version;for(let y=0,x=E.length;y<x;y+=3){const D=E[y+0],R=E[y+1],A=E[y+2];f.push(D,R,R,A,A,D)}}else if(g!==void 0){const E=g.array;v=g.version;for(let y=0,x=E.length/3-1;y<x;y+=3){const D=y+0,R=y+1,A=y+2;f.push(D,R,R,A,A,D)}}else return;const m=new(ef(f)?rf:sf)(f,1);m.version=v;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function yv(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,d){i.drawElements(n,d,r,f*o),t.update(d,n,1)}function l(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*o,g),t.update(d,n,g))}function h(f,d,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];t.update(m,n,1)}function u(f,d,g,v){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)l(f[p]/o,d[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,v,0,g);let p=0;for(let E=0;E<g;E++)p+=d[E]*v[E];t.update(p,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Mv(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Sv(i,e,t){const n=new WeakMap,s=new gt;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(a);if(f===void 0||f.count!==u){let M=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",M)};var d=M;f!==void 0&&f.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],E=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let D=a.attributes.position.count*x,R=1;D>e.maxTextureSize&&(R=Math.ceil(D/e.maxTextureSize),D=e.maxTextureSize);const A=new Float32Array(D*R*4*u),I=new tf(A,D,R,u);I.type=ci,I.needsUpdate=!0;const T=x*4;for(let L=0;L<u;L++){const V=p[L],G=E[L],j=y[L],U=D*R*4*L;for(let F=0;F<V.count;F++){const W=F*T;g===!0&&(s.fromBufferAttribute(V,F),A[U+W+0]=s.x,A[U+W+1]=s.y,A[U+W+2]=s.z,A[U+W+3]=0),v===!0&&(s.fromBufferAttribute(G,F),A[U+W+4]=s.x,A[U+W+5]=s.y,A[U+W+6]=s.z,A[U+W+7]=0),m===!0&&(s.fromBufferAttribute(j,F),A[U+W+8]=s.x,A[U+W+9]=s.y,A[U+W+10]=s.z,A[U+W+11]=j.itemSize===4?s.w:1)}}f={count:u,texture:I,size:new ee(D,R)},n.set(a,f),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const v=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(i,"morphTargetBaseInfluence",v),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function Ev(i,e,t,n){let s=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(s.get(u)!==l&&(e.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return u}function o(){s=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}const bf=new on,tu=new df(1,1),wf=new tf,Cf=new mm,Af=new lf,nu=[],iu=[],su=new Float32Array(16),ru=new Float32Array(9),ou=new Float32Array(4);function nr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=nu[s];if(r===void 0&&(r=new Float32Array(s),nu[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Bt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function kt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ha(i,e){let t=iu[e];t===void 0&&(t=new Int32Array(e),iu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Tv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function bv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;i.uniform2fv(this.addr,e),kt(t,e)}}function wv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Bt(t,e))return;i.uniform3fv(this.addr,e),kt(t,e)}}function Cv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;i.uniform4fv(this.addr,e),kt(t,e)}}function Av(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;ou.set(n),i.uniformMatrix2fv(this.addr,!1,ou),kt(t,n)}}function Rv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;ru.set(n),i.uniformMatrix3fv(this.addr,!1,ru),kt(t,n)}}function Pv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;su.set(n),i.uniformMatrix4fv(this.addr,!1,su),kt(t,n)}}function Dv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Iv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;i.uniform2iv(this.addr,e),kt(t,e)}}function Lv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;i.uniform3iv(this.addr,e),kt(t,e)}}function Uv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;i.uniform4iv(this.addr,e),kt(t,e)}}function Nv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ov(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;i.uniform2uiv(this.addr,e),kt(t,e)}}function Fv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;i.uniform3uiv(this.addr,e),kt(t,e)}}function zv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;i.uniform4uiv(this.addr,e),kt(t,e)}}function Bv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(tu.compareFunction=Qu,r=tu):r=bf,t.setTexture2D(e||r,s)}function kv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Cf,s)}function Hv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Af,s)}function Gv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||wf,s)}function Vv(i){switch(i){case 5126:return Tv;case 35664:return bv;case 35665:return wv;case 35666:return Cv;case 35674:return Av;case 35675:return Rv;case 35676:return Pv;case 5124:case 35670:return Dv;case 35667:case 35671:return Iv;case 35668:case 35672:return Lv;case 35669:case 35673:return Uv;case 5125:return Nv;case 36294:return Ov;case 36295:return Fv;case 36296:return zv;case 35678:case 36198:case 36298:case 36306:case 35682:return Bv;case 35679:case 36299:case 36307:return kv;case 35680:case 36300:case 36308:case 36293:return Hv;case 36289:case 36303:case 36311:case 36292:return Gv}}function Wv(i,e){i.uniform1fv(this.addr,e)}function Xv(i,e){const t=nr(e,this.size,2);i.uniform2fv(this.addr,t)}function $v(i,e){const t=nr(e,this.size,3);i.uniform3fv(this.addr,t)}function qv(i,e){const t=nr(e,this.size,4);i.uniform4fv(this.addr,t)}function Yv(i,e){const t=nr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function jv(i,e){const t=nr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Kv(i,e){const t=nr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Zv(i,e){i.uniform1iv(this.addr,e)}function Jv(i,e){i.uniform2iv(this.addr,e)}function Qv(i,e){i.uniform3iv(this.addr,e)}function ex(i,e){i.uniform4iv(this.addr,e)}function tx(i,e){i.uniform1uiv(this.addr,e)}function nx(i,e){i.uniform2uiv(this.addr,e)}function ix(i,e){i.uniform3uiv(this.addr,e)}function sx(i,e){i.uniform4uiv(this.addr,e)}function rx(i,e,t){const n=this.cache,s=e.length,r=ha(t,s);Bt(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||bf,r[o])}function ox(i,e,t){const n=this.cache,s=e.length,r=ha(t,s);Bt(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Cf,r[o])}function ax(i,e,t){const n=this.cache,s=e.length,r=ha(t,s);Bt(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Af,r[o])}function cx(i,e,t){const n=this.cache,s=e.length,r=ha(t,s);Bt(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||wf,r[o])}function lx(i){switch(i){case 5126:return Wv;case 35664:return Xv;case 35665:return $v;case 35666:return qv;case 35674:return Yv;case 35675:return jv;case 35676:return Kv;case 5124:case 35670:return Zv;case 35667:case 35671:return Jv;case 35668:case 35672:return Qv;case 35669:case 35673:return ex;case 5125:return tx;case 36294:return nx;case 36295:return ix;case 36296:return sx;case 35678:case 36198:case 36298:case 36306:case 35682:return rx;case 35679:case 36299:case 36307:return ox;case 35680:case 36300:case 36308:case 36293:return ax;case 36289:case 36303:case 36311:case 36292:return cx}}class hx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Vv(t.type)}}class ux{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=lx(t.type)}}class fx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const Ka=/(\w+)(\])?(\[|\.)?/g;function au(i,e){i.seq.push(e),i.map[e.id]=e}function dx(i,e,t){const n=i.name,s=n.length;for(Ka.lastIndex=0;;){const r=Ka.exec(n),o=Ka.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){au(t,l===void 0?new hx(a,i,e):new ux(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new fx(a),au(t,u)),t=u}}}class Uo{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);dx(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function cu(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const px=37297;let mx=0;function gx(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const lu=new je;function _x(i){ot._getMatrix(lu,ot.workingColorSpace,i);const e=`mat3( ${lu.elements.map(t=>t.toFixed(4))} )`;switch(ot.getTransfer(i)){case Wo:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function hu(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+gx(i.getShaderSource(e),o)}else return s}function vx(i,e){const t=_x(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function xx(i,e){let t;switch(e){case Cp:t="Linear";break;case Ap:t="Reinhard";break;case Rp:t="Cineon";break;case Gu:t="ACESFilmic";break;case Dp:t="AgX";break;case Ip:t="Neutral";break;case Pp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wo=new P;function yx(){ot.getLuminanceCoefficients(wo);const i=wo.x.toFixed(4),e=wo.y.toFixed(4),t=wo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Mx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xr).join(`
`)}function Sx(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Ex(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function xr(i){return i!==""}function uu(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function fu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Tx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yc(i){return i.replace(Tx,wx)}const bx=new Map;function wx(i,e){let t=Ze[e];if(t===void 0){const n=bx.get(e);if(n!==void 0)t=Ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Yc(t)}const Cx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function du(i){return i.replace(Cx,Ax)}function Ax(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function pu(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Rx(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Bu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===ku?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function Px(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Xs:case $s:e="ENVMAP_TYPE_CUBE";break;case oa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Dx(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case $s:e="ENVMAP_MODE_REFRACTION";break}return e}function Ix(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Hu:e="ENVMAP_BLENDING_MULTIPLY";break;case bp:e="ENVMAP_BLENDING_MIX";break;case wp:e="ENVMAP_BLENDING_ADD";break}return e}function Lx(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Ux(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=Rx(t),l=Px(t),h=Dx(t),u=Ix(t),f=Lx(t),d=Mx(t),g=Sx(r),v=s.createProgram();let m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(xr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(xr).join(`
`),p.length>0&&(p+=`
`)):(m=[pu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xr).join(`
`),p=[pu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==wi?"#define TONE_MAPPING":"",t.toneMapping!==wi?Ze.tonemapping_pars_fragment:"",t.toneMapping!==wi?xx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,vx("linearToOutputTexel",t.outputColorSpace),yx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xr).join(`
`)),o=Yc(o),o=uu(o,t),o=fu(o,t),a=Yc(a),a=uu(a,t),a=fu(a,t),o=du(o),a=du(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===lh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=E+m+o,x=E+p+a,D=cu(s,s.VERTEX_SHADER,y),R=cu(s,s.FRAGMENT_SHADER,x);s.attachShader(v,D),s.attachShader(v,R),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(L){if(i.debug.checkShaderErrors){const V=s.getProgramInfoLog(v).trim(),G=s.getShaderInfoLog(D).trim(),j=s.getShaderInfoLog(R).trim();let U=!0,F=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(U=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,D,R);else{const W=hu(s,D,"vertex"),N=hu(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+V+`
`+W+`
`+N)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(G===""||j==="")&&(F=!1);F&&(L.diagnostics={runnable:U,programLog:V,vertexShader:{log:G,prefix:m},fragmentShader:{log:j,prefix:p}})}s.deleteShader(D),s.deleteShader(R),I=new Uo(s,v),T=Ex(s,v)}let I;this.getUniforms=function(){return I===void 0&&A(this),I};let T;this.getAttributes=function(){return T===void 0&&A(this),T};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(v,px)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=mx++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=D,this.fragmentShader=R,this}let Nx=0;class Ox{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Fx(e),t.set(e,n)),n}}class Fx{constructor(e){this.id=Nx++,this.code=e,this.usedTimes=0}}function zx(i,e,t,n,s,r,o){const a=new Al,c=new Ox,l=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let d=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(T){return l.add(T),T===0?"uv":`uv${T}`}function m(T,M,L,V,G){const j=V.fog,U=G.geometry,F=T.isMeshStandardMaterial?V.environment:null,W=(T.isMeshStandardMaterial?t:e).get(T.envMap||F),N=W&&W.mapping===oa?W.image.height:null,oe=g[T.type];T.precision!==null&&(d=s.getMaxPrecision(T.precision),d!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",d,"instead."));const fe=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,ve=fe!==void 0?fe.length:0;let De=0;U.morphAttributes.position!==void 0&&(De=1),U.morphAttributes.normal!==void 0&&(De=2),U.morphAttributes.color!==void 0&&(De=3);let $e,Y,ce,be;if(oe){const lt=Gn[oe];$e=lt.vertexShader,Y=lt.fragmentShader}else $e=T.vertexShader,Y=T.fragmentShader,c.update(T),ce=c.getVertexShaderID(T),be=c.getFragmentShaderID(T);const pe=i.getRenderTarget(),Ie=i.state.buffers.depth.getReversed(),ze=G.isInstancedMesh===!0,Ue=G.isBatchedMesh===!0,He=!!T.map,Je=!!T.matcap,Le=!!W,w=!!T.aoMap,de=!!T.lightMap,se=!!T.bumpMap,le=!!T.normalMap,J=!!T.displacementMap,ge=!!T.emissiveMap,re=!!T.metalnessMap,C=!!T.roughnessMap,S=T.anisotropy>0,B=T.clearcoat>0,K=T.dispersion>0,te=T.iridescence>0,q=T.sheen>0,ne=T.transmission>0,Q=S&&!!T.anisotropyMap,Te=B&&!!T.clearcoatMap,Ne=B&&!!T.clearcoatNormalMap,ae=B&&!!T.clearcoatRoughnessMap,Se=te&&!!T.iridescenceMap,Oe=te&&!!T.iridescenceThicknessMap,Ge=q&&!!T.sheenColorMap,we=q&&!!T.sheenRoughnessMap,tt=!!T.specularMap,Ke=!!T.specularColorMap,xt=!!T.specularIntensityMap,O=ne&&!!T.transmissionMap,xe=ne&&!!T.thicknessMap,Z=!!T.gradientMap,ie=!!T.alphaMap,Ee=T.alphaTest>0,ye=!!T.alphaHash,qe=!!T.extensions;let Rt=wi;T.toneMapped&&(pe===null||pe.isXRRenderTarget===!0)&&(Rt=i.toneMapping);const $t={shaderID:oe,shaderType:T.type,shaderName:T.name,vertexShader:$e,fragmentShader:Y,defines:T.defines,customVertexShaderID:ce,customFragmentShaderID:be,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:d,batching:Ue,batchingColor:Ue&&G._colorsTexture!==null,instancing:ze,instancingColor:ze&&G.instanceColor!==null,instancingMorph:ze&&G.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:pe===null?i.outputColorSpace:pe.isXRRenderTarget===!0?pe.texture.colorSpace:qs,alphaToCoverage:!!T.alphaToCoverage,map:He,matcap:Je,envMap:Le,envMapMode:Le&&W.mapping,envMapCubeUVHeight:N,aoMap:w,lightMap:de,bumpMap:se,normalMap:le,displacementMap:f&&J,emissiveMap:ge,normalMapObjectSpace:le&&T.normalMapType===Op,normalMapTangentSpace:le&&T.normalMapType===Ju,metalnessMap:re,roughnessMap:C,anisotropy:S,anisotropyMap:Q,clearcoat:B,clearcoatMap:Te,clearcoatNormalMap:Ne,clearcoatRoughnessMap:ae,dispersion:K,iridescence:te,iridescenceMap:Se,iridescenceThicknessMap:Oe,sheen:q,sheenColorMap:Ge,sheenRoughnessMap:we,specularMap:tt,specularColorMap:Ke,specularIntensityMap:xt,transmission:ne,transmissionMap:O,thicknessMap:xe,gradientMap:Z,opaque:T.transparent===!1&&T.blending===Ns&&T.alphaToCoverage===!1,alphaMap:ie,alphaTest:Ee,alphaHash:ye,combine:T.combine,mapUv:He&&v(T.map.channel),aoMapUv:w&&v(T.aoMap.channel),lightMapUv:de&&v(T.lightMap.channel),bumpMapUv:se&&v(T.bumpMap.channel),normalMapUv:le&&v(T.normalMap.channel),displacementMapUv:J&&v(T.displacementMap.channel),emissiveMapUv:ge&&v(T.emissiveMap.channel),metalnessMapUv:re&&v(T.metalnessMap.channel),roughnessMapUv:C&&v(T.roughnessMap.channel),anisotropyMapUv:Q&&v(T.anisotropyMap.channel),clearcoatMapUv:Te&&v(T.clearcoatMap.channel),clearcoatNormalMapUv:Ne&&v(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&v(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&v(T.iridescenceMap.channel),iridescenceThicknessMapUv:Oe&&v(T.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&v(T.sheenColorMap.channel),sheenRoughnessMapUv:we&&v(T.sheenRoughnessMap.channel),specularMapUv:tt&&v(T.specularMap.channel),specularColorMapUv:Ke&&v(T.specularColorMap.channel),specularIntensityMapUv:xt&&v(T.specularIntensityMap.channel),transmissionMapUv:O&&v(T.transmissionMap.channel),thicknessMapUv:xe&&v(T.thicknessMap.channel),alphaMapUv:ie&&v(T.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(le||S),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!U.attributes.uv&&(He||ie),fog:!!j,useFog:T.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Ie,skinning:G.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:ve,morphTextureStride:De,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:Rt,decodeVideoTexture:He&&T.map.isVideoTexture===!0&&ot.getTransfer(T.map.colorSpace)===dt,decodeVideoTextureEmissive:ge&&T.emissiveMap.isVideoTexture===!0&&ot.getTransfer(T.emissiveMap.colorSpace)===dt,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Mt,flipSided:T.side===dn,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:qe&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(qe&&T.extensions.multiDraw===!0||Ue)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return $t.vertexUv1s=l.has(1),$t.vertexUv2s=l.has(2),$t.vertexUv3s=l.has(3),l.clear(),$t}function p(T){const M=[];if(T.shaderID?M.push(T.shaderID):(M.push(T.customVertexShaderID),M.push(T.customFragmentShaderID)),T.defines!==void 0)for(const L in T.defines)M.push(L),M.push(T.defines[L]);return T.isRawShaderMaterial===!1&&(E(M,T),y(M,T),M.push(i.outputColorSpace)),M.push(T.customProgramCacheKey),M.join()}function E(T,M){T.push(M.precision),T.push(M.outputColorSpace),T.push(M.envMapMode),T.push(M.envMapCubeUVHeight),T.push(M.mapUv),T.push(M.alphaMapUv),T.push(M.lightMapUv),T.push(M.aoMapUv),T.push(M.bumpMapUv),T.push(M.normalMapUv),T.push(M.displacementMapUv),T.push(M.emissiveMapUv),T.push(M.metalnessMapUv),T.push(M.roughnessMapUv),T.push(M.anisotropyMapUv),T.push(M.clearcoatMapUv),T.push(M.clearcoatNormalMapUv),T.push(M.clearcoatRoughnessMapUv),T.push(M.iridescenceMapUv),T.push(M.iridescenceThicknessMapUv),T.push(M.sheenColorMapUv),T.push(M.sheenRoughnessMapUv),T.push(M.specularMapUv),T.push(M.specularColorMapUv),T.push(M.specularIntensityMapUv),T.push(M.transmissionMapUv),T.push(M.thicknessMapUv),T.push(M.combine),T.push(M.fogExp2),T.push(M.sizeAttenuation),T.push(M.morphTargetsCount),T.push(M.morphAttributeCount),T.push(M.numDirLights),T.push(M.numPointLights),T.push(M.numSpotLights),T.push(M.numSpotLightMaps),T.push(M.numHemiLights),T.push(M.numRectAreaLights),T.push(M.numDirLightShadows),T.push(M.numPointLightShadows),T.push(M.numSpotLightShadows),T.push(M.numSpotLightShadowsWithMaps),T.push(M.numLightProbes),T.push(M.shadowMapType),T.push(M.toneMapping),T.push(M.numClippingPlanes),T.push(M.numClipIntersection),T.push(M.depthPacking)}function y(T,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),T.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),T.push(a.mask)}function x(T){const M=g[T.type];let L;if(M){const V=Gn[M];L=af.clone(V.uniforms)}else L=T.uniforms;return L}function D(T,M){let L;for(let V=0,G=h.length;V<G;V++){const j=h[V];if(j.cacheKey===M){L=j,++L.usedTimes;break}}return L===void 0&&(L=new Ux(i,M,T,r),h.push(L)),L}function R(T){if(--T.usedTimes===0){const M=h.indexOf(T);h[M]=h[h.length-1],h.pop(),T.destroy()}}function A(T){c.remove(T)}function I(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:D,releaseProgram:R,releaseShaderCache:A,programs:h,dispose:I}}function Bx(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function kx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function mu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function gu(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,f,d,g,v,m){let p=i[e];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:v,group:m},i[e]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=v,p.group=m),e++,p}function a(u,f,d,g,v,m){const p=o(u,f,d,g,v,m);d.transmission>0?n.push(p):d.transparent===!0?s.push(p):t.push(p)}function c(u,f,d,g,v,m){const p=o(u,f,d,g,v,m);d.transmission>0?n.unshift(p):d.transparent===!0?s.unshift(p):t.unshift(p)}function l(u,f){t.length>1&&t.sort(u||kx),n.length>1&&n.sort(f||mu),s.length>1&&s.sort(f||mu)}function h(){for(let u=e,f=i.length;u<f;u++){const d=i[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:h,sort:l}}function Hx(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new gu,i.set(n,[o])):s>=r.length?(o=new gu,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Gx(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ae};break;case"SpotLight":t={position:new P,direction:new P,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Vx(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Wx=0;function Xx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function $x(i){const e=new Gx,t=Vx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new P);const s=new P,r=new _t,o=new _t;function a(l){let h=0,u=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,E=0,y=0,x=0,D=0,R=0,A=0;l.sort(Xx);for(let T=0,M=l.length;T<M;T++){const L=l[T],V=L.color,G=L.intensity,j=L.distance,U=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=V.r*G,u+=V.g*G,f+=V.b*G;else if(L.isLightProbe){for(let F=0;F<9;F++)n.probe[F].addScaledVector(L.sh.coefficients[F],G);A++}else if(L.isDirectionalLight){const F=e.get(L);if(F.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const W=L.shadow,N=t.get(L);N.shadowIntensity=W.intensity,N.shadowBias=W.bias,N.shadowNormalBias=W.normalBias,N.shadowRadius=W.radius,N.shadowMapSize=W.mapSize,n.directionalShadow[d]=N,n.directionalShadowMap[d]=U,n.directionalShadowMatrix[d]=L.shadow.matrix,E++}n.directional[d]=F,d++}else if(L.isSpotLight){const F=e.get(L);F.position.setFromMatrixPosition(L.matrixWorld),F.color.copy(V).multiplyScalar(G),F.distance=j,F.coneCos=Math.cos(L.angle),F.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),F.decay=L.decay,n.spot[v]=F;const W=L.shadow;if(L.map&&(n.spotLightMap[D]=L.map,D++,W.updateMatrices(L),L.castShadow&&R++),n.spotLightMatrix[v]=W.matrix,L.castShadow){const N=t.get(L);N.shadowIntensity=W.intensity,N.shadowBias=W.bias,N.shadowNormalBias=W.normalBias,N.shadowRadius=W.radius,N.shadowMapSize=W.mapSize,n.spotShadow[v]=N,n.spotShadowMap[v]=U,x++}v++}else if(L.isRectAreaLight){const F=e.get(L);F.color.copy(V).multiplyScalar(G),F.halfWidth.set(L.width*.5,0,0),F.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=F,m++}else if(L.isPointLight){const F=e.get(L);if(F.color.copy(L.color).multiplyScalar(L.intensity),F.distance=L.distance,F.decay=L.decay,L.castShadow){const W=L.shadow,N=t.get(L);N.shadowIntensity=W.intensity,N.shadowBias=W.bias,N.shadowNormalBias=W.normalBias,N.shadowRadius=W.radius,N.shadowMapSize=W.mapSize,N.shadowCameraNear=W.camera.near,N.shadowCameraFar=W.camera.far,n.pointShadow[g]=N,n.pointShadowMap[g]=U,n.pointShadowMatrix[g]=L.shadow.matrix,y++}n.point[g]=F,g++}else if(L.isHemisphereLight){const F=e.get(L);F.skyColor.copy(L.color).multiplyScalar(G),F.groundColor.copy(L.groundColor).multiplyScalar(G),n.hemi[p]=F,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const I=n.hash;(I.directionalLength!==d||I.pointLength!==g||I.spotLength!==v||I.rectAreaLength!==m||I.hemiLength!==p||I.numDirectionalShadows!==E||I.numPointShadows!==y||I.numSpotShadows!==x||I.numSpotMaps!==D||I.numLightProbes!==A)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=x+D-R,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=A,I.directionalLength=d,I.pointLength=g,I.spotLength=v,I.rectAreaLength=m,I.hemiLength=p,I.numDirectionalShadows=E,I.numPointShadows=y,I.numSpotShadows=x,I.numSpotMaps=D,I.numLightProbes=A,n.version=Wx++)}function c(l,h){let u=0,f=0,d=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,E=l.length;p<E;p++){const y=l[p];if(y.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),u++}else if(y.isSpotLight){const x=n.spot[d];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),d++}else if(y.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),x.halfWidth.set(y.width*.5,0,0),x.halfHeight.set(0,y.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){const x=n.point[f];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(y.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:a,setupView:c,state:n}}function _u(i){const e=new $x(i),t=[],n=[];function s(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function c(h){e.setupView(t,h)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function qx(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new _u(i),e.set(s,[a])):r>=o.length?(a=new _u(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const Yx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Kx(i,e,t){let n=new Pl;const s=new ee,r=new ee,o=new gt,a=new g0({depthPacking:Np}),c=new _0,l={},h=t.maxTextureSize,u={[Ri]:dn,[dn]:Ri,[Mt]:Mt},f=new jn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ee},radius:{value:4}},vertexShader:Yx,fragmentShader:jx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new At;g.setAttribute("position",new kn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new H(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Bu;let p=this.type;this.render=function(R,A,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const T=i.getRenderTarget(),M=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),V=i.state;V.setBlending(fi),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);const G=p!==ri&&this.type===ri,j=p===ri&&this.type!==ri;for(let U=0,F=R.length;U<F;U++){const W=R[U],N=W.shadow;if(N===void 0){console.warn("THREE.WebGLShadowMap:",W,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;s.copy(N.mapSize);const oe=N.getFrameExtents();if(s.multiply(oe),r.copy(N.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/oe.x),s.x=r.x*oe.x,N.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/oe.y),s.y=r.y*oe.y,N.mapSize.y=r.y)),N.map===null||G===!0||j===!0){const ve=this.type!==ri?{minFilter:wn,magFilter:wn}:{};N.map!==null&&N.map.dispose(),N.map=new Pi(s.x,s.y,ve),N.map.texture.name=W.name+".shadowMap",N.camera.updateProjectionMatrix()}i.setRenderTarget(N.map),i.clear();const fe=N.getViewportCount();for(let ve=0;ve<fe;ve++){const De=N.getViewport(ve);o.set(r.x*De.x,r.y*De.y,r.x*De.z,r.y*De.w),V.viewport(o),N.updateMatrices(W,ve),n=N.getFrustum(),x(A,I,N.camera,W,this.type)}N.isPointLightShadow!==!0&&this.type===ri&&E(N,I),N.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,M,L)};function E(R,A){const I=e.update(v);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Pi(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(A,null,I,f,v,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(A,null,I,d,v,null)}function y(R,A,I,T){let M=null;const L=I.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(L!==void 0)M=L;else if(M=I.isPointLight===!0?c:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const V=M.uuid,G=A.uuid;let j=l[V];j===void 0&&(j={},l[V]=j);let U=j[G];U===void 0&&(U=M.clone(),j[G]=U,A.addEventListener("dispose",D)),M=U}if(M.visible=A.visible,M.wireframe=A.wireframe,T===ri?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:u[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,I.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const V=i.properties.get(M);V.light=I}return M}function x(R,A,I,T,M){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&M===ri)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,R.matrixWorld);const G=e.update(R),j=R.material;if(Array.isArray(j)){const U=G.groups;for(let F=0,W=U.length;F<W;F++){const N=U[F],oe=j[N.materialIndex];if(oe&&oe.visible){const fe=y(R,oe,T,M);R.onBeforeShadow(i,R,A,I,G,fe,N),i.renderBufferDirect(I,null,G,fe,R,N),R.onAfterShadow(i,R,A,I,G,fe,N)}}}else if(j.visible){const U=y(R,j,T,M);R.onBeforeShadow(i,R,A,I,G,U,null),i.renderBufferDirect(I,null,G,U,R,null),R.onAfterShadow(i,R,A,I,G,U,null)}}const V=R.children;for(let G=0,j=V.length;G<j;G++)x(V[G],A,I,T,M)}function D(R){R.target.removeEventListener("dispose",D);for(const I in l){const T=l[I],M=R.target.uuid;M in T&&(T[M].dispose(),delete T[M])}}}const Zx={[oc]:ac,[cc]:uc,[lc]:fc,[Ws]:hc,[ac]:oc,[uc]:cc,[fc]:lc,[hc]:Ws};function Jx(i,e){function t(){let O=!1;const xe=new gt;let Z=null;const ie=new gt(0,0,0,0);return{setMask:function(Ee){Z!==Ee&&!O&&(i.colorMask(Ee,Ee,Ee,Ee),Z=Ee)},setLocked:function(Ee){O=Ee},setClear:function(Ee,ye,qe,Rt,$t){$t===!0&&(Ee*=Rt,ye*=Rt,qe*=Rt),xe.set(Ee,ye,qe,Rt),ie.equals(xe)===!1&&(i.clearColor(Ee,ye,qe,Rt),ie.copy(xe))},reset:function(){O=!1,Z=null,ie.set(-1,0,0,0)}}}function n(){let O=!1,xe=!1,Z=null,ie=null,Ee=null;return{setReversed:function(ye){if(xe!==ye){const qe=e.get("EXT_clip_control");ye?qe.clipControlEXT(qe.LOWER_LEFT_EXT,qe.ZERO_TO_ONE_EXT):qe.clipControlEXT(qe.LOWER_LEFT_EXT,qe.NEGATIVE_ONE_TO_ONE_EXT),xe=ye;const Rt=Ee;Ee=null,this.setClear(Rt)}},getReversed:function(){return xe},setTest:function(ye){ye?pe(i.DEPTH_TEST):Ie(i.DEPTH_TEST)},setMask:function(ye){Z!==ye&&!O&&(i.depthMask(ye),Z=ye)},setFunc:function(ye){if(xe&&(ye=Zx[ye]),ie!==ye){switch(ye){case oc:i.depthFunc(i.NEVER);break;case ac:i.depthFunc(i.ALWAYS);break;case cc:i.depthFunc(i.LESS);break;case Ws:i.depthFunc(i.LEQUAL);break;case lc:i.depthFunc(i.EQUAL);break;case hc:i.depthFunc(i.GEQUAL);break;case uc:i.depthFunc(i.GREATER);break;case fc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ie=ye}},setLocked:function(ye){O=ye},setClear:function(ye){Ee!==ye&&(xe&&(ye=1-ye),i.clearDepth(ye),Ee=ye)},reset:function(){O=!1,Z=null,ie=null,Ee=null,xe=!1}}}function s(){let O=!1,xe=null,Z=null,ie=null,Ee=null,ye=null,qe=null,Rt=null,$t=null;return{setTest:function(lt){O||(lt?pe(i.STENCIL_TEST):Ie(i.STENCIL_TEST))},setMask:function(lt){xe!==lt&&!O&&(i.stencilMask(lt),xe=lt)},setFunc:function(lt,Rn,Jn){(Z!==lt||ie!==Rn||Ee!==Jn)&&(i.stencilFunc(lt,Rn,Jn),Z=lt,ie=Rn,Ee=Jn)},setOp:function(lt,Rn,Jn){(ye!==lt||qe!==Rn||Rt!==Jn)&&(i.stencilOp(lt,Rn,Jn),ye=lt,qe=Rn,Rt=Jn)},setLocked:function(lt){O=lt},setClear:function(lt){$t!==lt&&(i.clearStencil(lt),$t=lt)},reset:function(){O=!1,xe=null,Z=null,ie=null,Ee=null,ye=null,qe=null,Rt=null,$t=null}}}const r=new t,o=new n,a=new s,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,E=null,y=null,x=null,D=null,R=null,A=new Ae(0,0,0),I=0,T=!1,M=null,L=null,V=null,G=null,j=null;const U=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let F=!1,W=0;const N=i.getParameter(i.VERSION);N.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(N)[1]),F=W>=1):N.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),F=W>=2);let oe=null,fe={};const ve=i.getParameter(i.SCISSOR_BOX),De=i.getParameter(i.VIEWPORT),$e=new gt().fromArray(ve),Y=new gt().fromArray(De);function ce(O,xe,Z,ie){const Ee=new Uint8Array(4),ye=i.createTexture();i.bindTexture(O,ye),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let qe=0;qe<Z;qe++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(xe,0,i.RGBA,1,1,ie,0,i.RGBA,i.UNSIGNED_BYTE,Ee):i.texImage2D(xe+qe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ee);return ye}const be={};be[i.TEXTURE_2D]=ce(i.TEXTURE_2D,i.TEXTURE_2D,1),be[i.TEXTURE_CUBE_MAP]=ce(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),be[i.TEXTURE_2D_ARRAY]=ce(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),be[i.TEXTURE_3D]=ce(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),pe(i.DEPTH_TEST),o.setFunc(Ws),se(!1),le(rh),pe(i.CULL_FACE),w(fi);function pe(O){h[O]!==!0&&(i.enable(O),h[O]=!0)}function Ie(O){h[O]!==!1&&(i.disable(O),h[O]=!1)}function ze(O,xe){return u[O]!==xe?(i.bindFramebuffer(O,xe),u[O]=xe,O===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=xe),O===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=xe),!0):!1}function Ue(O,xe){let Z=d,ie=!1;if(O){Z=f.get(xe),Z===void 0&&(Z=[],f.set(xe,Z));const Ee=O.textures;if(Z.length!==Ee.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let ye=0,qe=Ee.length;ye<qe;ye++)Z[ye]=i.COLOR_ATTACHMENT0+ye;Z.length=Ee.length,ie=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,ie=!0);ie&&i.drawBuffers(Z)}function He(O){return g!==O?(i.useProgram(O),g=O,!0):!1}const Je={[$i]:i.FUNC_ADD,[cp]:i.FUNC_SUBTRACT,[lp]:i.FUNC_REVERSE_SUBTRACT};Je[hp]=i.MIN,Je[up]=i.MAX;const Le={[fp]:i.ZERO,[dp]:i.ONE,[pp]:i.SRC_COLOR,[sc]:i.SRC_ALPHA,[yp]:i.SRC_ALPHA_SATURATE,[vp]:i.DST_COLOR,[gp]:i.DST_ALPHA,[mp]:i.ONE_MINUS_SRC_COLOR,[rc]:i.ONE_MINUS_SRC_ALPHA,[xp]:i.ONE_MINUS_DST_COLOR,[_p]:i.ONE_MINUS_DST_ALPHA,[Mp]:i.CONSTANT_COLOR,[Sp]:i.ONE_MINUS_CONSTANT_COLOR,[Ep]:i.CONSTANT_ALPHA,[Tp]:i.ONE_MINUS_CONSTANT_ALPHA};function w(O,xe,Z,ie,Ee,ye,qe,Rt,$t,lt){if(O===fi){v===!0&&(Ie(i.BLEND),v=!1);return}if(v===!1&&(pe(i.BLEND),v=!0),O!==ap){if(O!==m||lt!==T){if((p!==$i||x!==$i)&&(i.blendEquation(i.FUNC_ADD),p=$i,x=$i),lt)switch(O){case Ns:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Er:i.blendFunc(i.ONE,i.ONE);break;case oh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ah:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case Ns:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Er:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case oh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ah:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}E=null,y=null,D=null,R=null,A.set(0,0,0),I=0,m=O,T=lt}return}Ee=Ee||xe,ye=ye||Z,qe=qe||ie,(xe!==p||Ee!==x)&&(i.blendEquationSeparate(Je[xe],Je[Ee]),p=xe,x=Ee),(Z!==E||ie!==y||ye!==D||qe!==R)&&(i.blendFuncSeparate(Le[Z],Le[ie],Le[ye],Le[qe]),E=Z,y=ie,D=ye,R=qe),(Rt.equals(A)===!1||$t!==I)&&(i.blendColor(Rt.r,Rt.g,Rt.b,$t),A.copy(Rt),I=$t),m=O,T=!1}function de(O,xe){O.side===Mt?Ie(i.CULL_FACE):pe(i.CULL_FACE);let Z=O.side===dn;xe&&(Z=!Z),se(Z),O.blending===Ns&&O.transparent===!1?w(fi):w(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);const ie=O.stencilWrite;a.setTest(ie),ie&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),ge(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?pe(i.SAMPLE_ALPHA_TO_COVERAGE):Ie(i.SAMPLE_ALPHA_TO_COVERAGE)}function se(O){M!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),M=O)}function le(O){O!==rp?(pe(i.CULL_FACE),O!==L&&(O===rh?i.cullFace(i.BACK):O===op?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ie(i.CULL_FACE),L=O}function J(O){O!==V&&(F&&i.lineWidth(O),V=O)}function ge(O,xe,Z){O?(pe(i.POLYGON_OFFSET_FILL),(G!==xe||j!==Z)&&(i.polygonOffset(xe,Z),G=xe,j=Z)):Ie(i.POLYGON_OFFSET_FILL)}function re(O){O?pe(i.SCISSOR_TEST):Ie(i.SCISSOR_TEST)}function C(O){O===void 0&&(O=i.TEXTURE0+U-1),oe!==O&&(i.activeTexture(O),oe=O)}function S(O,xe,Z){Z===void 0&&(oe===null?Z=i.TEXTURE0+U-1:Z=oe);let ie=fe[Z];ie===void 0&&(ie={type:void 0,texture:void 0},fe[Z]=ie),(ie.type!==O||ie.texture!==xe)&&(oe!==Z&&(i.activeTexture(Z),oe=Z),i.bindTexture(O,xe||be[O]),ie.type=O,ie.texture=xe)}function B(){const O=fe[oe];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function K(){try{i.compressedTexImage2D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function te(){try{i.compressedTexImage3D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function q(){try{i.texSubImage2D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ne(){try{i.texSubImage3D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Q(){try{i.compressedTexSubImage2D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Te(){try{i.compressedTexSubImage3D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ne(){try{i.texStorage2D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ae(){try{i.texStorage3D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Se(){try{i.texImage2D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Oe(){try{i.texImage3D(...arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ge(O){$e.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),$e.copy(O))}function we(O){Y.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),Y.copy(O))}function tt(O,xe){let Z=l.get(xe);Z===void 0&&(Z=new WeakMap,l.set(xe,Z));let ie=Z.get(O);ie===void 0&&(ie=i.getUniformBlockIndex(xe,O.name),Z.set(O,ie))}function Ke(O,xe){const ie=l.get(xe).get(O);c.get(xe)!==ie&&(i.uniformBlockBinding(xe,ie,O.__bindingPointIndex),c.set(xe,ie))}function xt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},oe=null,fe={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,E=null,y=null,x=null,D=null,R=null,A=new Ae(0,0,0),I=0,T=!1,M=null,L=null,V=null,G=null,j=null,$e.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:pe,disable:Ie,bindFramebuffer:ze,drawBuffers:Ue,useProgram:He,setBlending:w,setMaterial:de,setFlipSided:se,setCullFace:le,setLineWidth:J,setPolygonOffset:ge,setScissorTest:re,activeTexture:C,bindTexture:S,unbindTexture:B,compressedTexImage2D:K,compressedTexImage3D:te,texImage2D:Se,texImage3D:Oe,updateUBOMapping:tt,uniformBlockBinding:Ke,texStorage2D:Ne,texStorage3D:ae,texSubImage2D:q,texSubImage3D:ne,compressedTexSubImage2D:Q,compressedTexSubImage3D:Te,scissor:Ge,viewport:we,reset:xt}}function Qx(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ee,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,S){return d?new OffscreenCanvas(C,S):$o("canvas")}function v(C,S,B){let K=1;const te=re(C);if((te.width>B||te.height>B)&&(K=B/Math.max(te.width,te.height)),K<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const q=Math.floor(K*te.width),ne=Math.floor(K*te.height);u===void 0&&(u=g(q,ne));const Q=S?g(q,ne):u;return Q.width=q,Q.height=ne,Q.getContext("2d").drawImage(C,0,0,q,ne),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+q+"x"+ne+")."),Q}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){i.generateMipmap(C)}function E(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,S,B,K,te=!1){if(C!==null){if(i[C]!==void 0)return i[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let q=S;if(S===i.RED&&(B===i.FLOAT&&(q=i.R32F),B===i.HALF_FLOAT&&(q=i.R16F),B===i.UNSIGNED_BYTE&&(q=i.R8)),S===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.R8UI),B===i.UNSIGNED_SHORT&&(q=i.R16UI),B===i.UNSIGNED_INT&&(q=i.R32UI),B===i.BYTE&&(q=i.R8I),B===i.SHORT&&(q=i.R16I),B===i.INT&&(q=i.R32I)),S===i.RG&&(B===i.FLOAT&&(q=i.RG32F),B===i.HALF_FLOAT&&(q=i.RG16F),B===i.UNSIGNED_BYTE&&(q=i.RG8)),S===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RG8UI),B===i.UNSIGNED_SHORT&&(q=i.RG16UI),B===i.UNSIGNED_INT&&(q=i.RG32UI),B===i.BYTE&&(q=i.RG8I),B===i.SHORT&&(q=i.RG16I),B===i.INT&&(q=i.RG32I)),S===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGB8UI),B===i.UNSIGNED_SHORT&&(q=i.RGB16UI),B===i.UNSIGNED_INT&&(q=i.RGB32UI),B===i.BYTE&&(q=i.RGB8I),B===i.SHORT&&(q=i.RGB16I),B===i.INT&&(q=i.RGB32I)),S===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),B===i.UNSIGNED_INT&&(q=i.RGBA32UI),B===i.BYTE&&(q=i.RGBA8I),B===i.SHORT&&(q=i.RGBA16I),B===i.INT&&(q=i.RGBA32I)),S===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),S===i.RGBA){const ne=te?Wo:ot.getTransfer(K);B===i.FLOAT&&(q=i.RGBA32F),B===i.HALF_FLOAT&&(q=i.RGBA16F),B===i.UNSIGNED_BYTE&&(q=ne===dt?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function x(C,S){let B;return C?S===null||S===ts||S===Ur?B=i.DEPTH24_STENCIL8:S===ci?B=i.DEPTH32F_STENCIL8:S===Lr&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===ts||S===Ur?B=i.DEPTH_COMPONENT24:S===ci?B=i.DEPTH_COMPONENT32F:S===Lr&&(B=i.DEPTH_COMPONENT16),B}function D(C,S){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==wn&&C.minFilter!==Vn?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function R(C){const S=C.target;S.removeEventListener("dispose",R),I(S),S.isVideoTexture&&h.delete(S)}function A(C){const S=C.target;S.removeEventListener("dispose",A),M(S)}function I(C){const S=n.get(C);if(S.__webglInit===void 0)return;const B=C.source,K=f.get(B);if(K){const te=K[S.__cacheKey];te.usedTimes--,te.usedTimes===0&&T(C),Object.keys(K).length===0&&f.delete(B)}n.remove(C)}function T(C){const S=n.get(C);i.deleteTexture(S.__webglTexture);const B=C.source,K=f.get(B);delete K[S.__cacheKey],o.memory.textures--}function M(C){const S=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(S.__webglFramebuffer[K]))for(let te=0;te<S.__webglFramebuffer[K].length;te++)i.deleteFramebuffer(S.__webglFramebuffer[K][te]);else i.deleteFramebuffer(S.__webglFramebuffer[K]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[K])}else{if(Array.isArray(S.__webglFramebuffer))for(let K=0;K<S.__webglFramebuffer.length;K++)i.deleteFramebuffer(S.__webglFramebuffer[K]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let K=0;K<S.__webglColorRenderbuffer.length;K++)S.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[K]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const B=C.textures;for(let K=0,te=B.length;K<te;K++){const q=n.get(B[K]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(B[K])}n.remove(C)}let L=0;function V(){L=0}function G(){const C=L;return C>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function j(C){const S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function U(C,S){const B=n.get(C);if(C.isVideoTexture&&J(C),C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){const K=C.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,C,S);return}}t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+S)}function F(C,S){const B=n.get(C);if(C.version>0&&B.__version!==C.version){Y(B,C,S);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+S)}function W(C,S){const B=n.get(C);if(C.version>0&&B.__version!==C.version){Y(B,C,S);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+S)}function N(C,S){const B=n.get(C);if(C.version>0&&B.__version!==C.version){ce(B,C,S);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+S)}const oe={[mi]:i.REPEAT,[ji]:i.CLAMP_TO_EDGE,[mc]:i.MIRRORED_REPEAT},fe={[wn]:i.NEAREST,[Lp]:i.NEAREST_MIPMAP_NEAREST,[jr]:i.NEAREST_MIPMAP_LINEAR,[Vn]:i.LINEAR,[ga]:i.LINEAR_MIPMAP_NEAREST,[Ki]:i.LINEAR_MIPMAP_LINEAR},ve={[Fp]:i.NEVER,[Vp]:i.ALWAYS,[zp]:i.LESS,[Qu]:i.LEQUAL,[Bp]:i.EQUAL,[Gp]:i.GEQUAL,[kp]:i.GREATER,[Hp]:i.NOTEQUAL};function De(C,S){if(S.type===ci&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Vn||S.magFilter===ga||S.magFilter===jr||S.magFilter===Ki||S.minFilter===Vn||S.minFilter===ga||S.minFilter===jr||S.minFilter===Ki)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,oe[S.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,oe[S.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,oe[S.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,fe[S.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,fe[S.minFilter]),S.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,ve[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===wn||S.minFilter!==jr&&S.minFilter!==Ki||S.type===ci&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function $e(C,S){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",R));const K=S.source;let te=f.get(K);te===void 0&&(te={},f.set(K,te));const q=j(S);if(q!==C.__cacheKey){te[q]===void 0&&(te[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),te[q].usedTimes++;const ne=te[C.__cacheKey];ne!==void 0&&(te[C.__cacheKey].usedTimes--,ne.usedTimes===0&&T(S)),C.__cacheKey=q,C.__webglTexture=te[q].texture}return B}function Y(C,S,B){let K=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(K=i.TEXTURE_3D);const te=$e(C,S),q=S.source;t.bindTexture(K,C.__webglTexture,i.TEXTURE0+B);const ne=n.get(q);if(q.version!==ne.__version||te===!0){t.activeTexture(i.TEXTURE0+B);const Q=ot.getPrimaries(ot.workingColorSpace),Te=S.colorSpace===Ti?null:ot.getPrimaries(S.colorSpace),Ne=S.colorSpace===Ti||Q===Te?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);let ae=v(S.image,!1,s.maxTextureSize);ae=ge(S,ae);const Se=r.convert(S.format,S.colorSpace),Oe=r.convert(S.type);let Ge=y(S.internalFormat,Se,Oe,S.colorSpace,S.isVideoTexture);De(K,S);let we;const tt=S.mipmaps,Ke=S.isVideoTexture!==!0,xt=ne.__version===void 0||te===!0,O=q.dataReady,xe=D(S,ae);if(S.isDepthTexture)Ge=x(S.format===Or,S.type),xt&&(Ke?t.texStorage2D(i.TEXTURE_2D,1,Ge,ae.width,ae.height):t.texImage2D(i.TEXTURE_2D,0,Ge,ae.width,ae.height,0,Se,Oe,null));else if(S.isDataTexture)if(tt.length>0){Ke&&xt&&t.texStorage2D(i.TEXTURE_2D,xe,Ge,tt[0].width,tt[0].height);for(let Z=0,ie=tt.length;Z<ie;Z++)we=tt[Z],Ke?O&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,we.width,we.height,Se,Oe,we.data):t.texImage2D(i.TEXTURE_2D,Z,Ge,we.width,we.height,0,Se,Oe,we.data);S.generateMipmaps=!1}else Ke?(xt&&t.texStorage2D(i.TEXTURE_2D,xe,Ge,ae.width,ae.height),O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ae.width,ae.height,Se,Oe,ae.data)):t.texImage2D(i.TEXTURE_2D,0,Ge,ae.width,ae.height,0,Se,Oe,ae.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Ke&&xt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,xe,Ge,tt[0].width,tt[0].height,ae.depth);for(let Z=0,ie=tt.length;Z<ie;Z++)if(we=tt[Z],S.format!==Bn)if(Se!==null)if(Ke){if(O)if(S.layerUpdates.size>0){const Ee=qh(we.width,we.height,S.format,S.type);for(const ye of S.layerUpdates){const qe=we.data.subarray(ye*Ee/we.data.BYTES_PER_ELEMENT,(ye+1)*Ee/we.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,ye,we.width,we.height,1,Se,qe)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,we.width,we.height,ae.depth,Se,we.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Z,Ge,we.width,we.height,ae.depth,0,we.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ke?O&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,we.width,we.height,ae.depth,Se,Oe,we.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Z,Ge,we.width,we.height,ae.depth,0,Se,Oe,we.data)}else{Ke&&xt&&t.texStorage2D(i.TEXTURE_2D,xe,Ge,tt[0].width,tt[0].height);for(let Z=0,ie=tt.length;Z<ie;Z++)we=tt[Z],S.format!==Bn?Se!==null?Ke?O&&t.compressedTexSubImage2D(i.TEXTURE_2D,Z,0,0,we.width,we.height,Se,we.data):t.compressedTexImage2D(i.TEXTURE_2D,Z,Ge,we.width,we.height,0,we.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ke?O&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,we.width,we.height,Se,Oe,we.data):t.texImage2D(i.TEXTURE_2D,Z,Ge,we.width,we.height,0,Se,Oe,we.data)}else if(S.isDataArrayTexture)if(Ke){if(xt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,xe,Ge,ae.width,ae.height,ae.depth),O)if(S.layerUpdates.size>0){const Z=qh(ae.width,ae.height,S.format,S.type);for(const ie of S.layerUpdates){const Ee=ae.data.subarray(ie*Z/ae.data.BYTES_PER_ELEMENT,(ie+1)*Z/ae.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ie,ae.width,ae.height,1,Se,Oe,Ee)}S.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,Se,Oe,ae.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ge,ae.width,ae.height,ae.depth,0,Se,Oe,ae.data);else if(S.isData3DTexture)Ke?(xt&&t.texStorage3D(i.TEXTURE_3D,xe,Ge,ae.width,ae.height,ae.depth),O&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,Se,Oe,ae.data)):t.texImage3D(i.TEXTURE_3D,0,Ge,ae.width,ae.height,ae.depth,0,Se,Oe,ae.data);else if(S.isFramebufferTexture){if(xt)if(Ke)t.texStorage2D(i.TEXTURE_2D,xe,Ge,ae.width,ae.height);else{let Z=ae.width,ie=ae.height;for(let Ee=0;Ee<xe;Ee++)t.texImage2D(i.TEXTURE_2D,Ee,Ge,Z,ie,0,Se,Oe,null),Z>>=1,ie>>=1}}else if(tt.length>0){if(Ke&&xt){const Z=re(tt[0]);t.texStorage2D(i.TEXTURE_2D,xe,Ge,Z.width,Z.height)}for(let Z=0,ie=tt.length;Z<ie;Z++)we=tt[Z],Ke?O&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,Se,Oe,we):t.texImage2D(i.TEXTURE_2D,Z,Ge,Se,Oe,we);S.generateMipmaps=!1}else if(Ke){if(xt){const Z=re(ae);t.texStorage2D(i.TEXTURE_2D,xe,Ge,Z.width,Z.height)}O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Se,Oe,ae)}else t.texImage2D(i.TEXTURE_2D,0,Ge,Se,Oe,ae);m(S)&&p(K),ne.__version=q.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function ce(C,S,B){if(S.image.length!==6)return;const K=$e(C,S),te=S.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+B);const q=n.get(te);if(te.version!==q.__version||K===!0){t.activeTexture(i.TEXTURE0+B);const ne=ot.getPrimaries(ot.workingColorSpace),Q=S.colorSpace===Ti?null:ot.getPrimaries(S.colorSpace),Te=S.colorSpace===Ti||ne===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);const Ne=S.isCompressedTexture||S.image[0].isCompressedTexture,ae=S.image[0]&&S.image[0].isDataTexture,Se=[];for(let ie=0;ie<6;ie++)!Ne&&!ae?Se[ie]=v(S.image[ie],!0,s.maxCubemapSize):Se[ie]=ae?S.image[ie].image:S.image[ie],Se[ie]=ge(S,Se[ie]);const Oe=Se[0],Ge=r.convert(S.format,S.colorSpace),we=r.convert(S.type),tt=y(S.internalFormat,Ge,we,S.colorSpace),Ke=S.isVideoTexture!==!0,xt=q.__version===void 0||K===!0,O=te.dataReady;let xe=D(S,Oe);De(i.TEXTURE_CUBE_MAP,S);let Z;if(Ne){Ke&&xt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,tt,Oe.width,Oe.height);for(let ie=0;ie<6;ie++){Z=Se[ie].mipmaps;for(let Ee=0;Ee<Z.length;Ee++){const ye=Z[Ee];S.format!==Bn?Ge!==null?Ke?O&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee,0,0,ye.width,ye.height,Ge,ye.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee,tt,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ke?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee,0,0,ye.width,ye.height,Ge,we,ye.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee,tt,ye.width,ye.height,0,Ge,we,ye.data)}}}else{if(Z=S.mipmaps,Ke&&xt){Z.length>0&&xe++;const ie=re(Se[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,tt,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(ae){Ke?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Se[ie].width,Se[ie].height,Ge,we,Se[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,tt,Se[ie].width,Se[ie].height,0,Ge,we,Se[ie].data);for(let Ee=0;Ee<Z.length;Ee++){const qe=Z[Ee].image[ie].image;Ke?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee+1,0,0,qe.width,qe.height,Ge,we,qe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee+1,tt,qe.width,qe.height,0,Ge,we,qe.data)}}else{Ke?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ge,we,Se[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,tt,Ge,we,Se[ie]);for(let Ee=0;Ee<Z.length;Ee++){const ye=Z[Ee];Ke?O&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee+1,0,0,Ge,we,ye.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ee+1,tt,Ge,we,ye.image[ie])}}}m(S)&&p(i.TEXTURE_CUBE_MAP),q.__version=te.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function be(C,S,B,K,te,q){const ne=r.convert(B.format,B.colorSpace),Q=r.convert(B.type),Te=y(B.internalFormat,ne,Q,B.colorSpace),Ne=n.get(S),ae=n.get(B);if(ae.__renderTarget=S,!Ne.__hasExternalTextures){const Se=Math.max(1,S.width>>q),Oe=Math.max(1,S.height>>q);te===i.TEXTURE_3D||te===i.TEXTURE_2D_ARRAY?t.texImage3D(te,q,Te,Se,Oe,S.depth,0,ne,Q,null):t.texImage2D(te,q,Te,Se,Oe,0,ne,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),le(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,te,ae.__webglTexture,0,se(S)):(te===i.TEXTURE_2D||te>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,te,ae.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function pe(C,S,B){if(i.bindRenderbuffer(i.RENDERBUFFER,C),S.depthBuffer){const K=S.depthTexture,te=K&&K.isDepthTexture?K.type:null,q=x(S.stencilBuffer,te),ne=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Q=se(S);le(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Q,q,S.width,S.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,q,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,q,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,C)}else{const K=S.textures;for(let te=0;te<K.length;te++){const q=K[te],ne=r.convert(q.format,q.colorSpace),Q=r.convert(q.type),Te=y(q.internalFormat,ne,Q,q.colorSpace),Ne=se(S);B&&le(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne,Te,S.width,S.height):le(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne,Te,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,Te,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ie(C,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=n.get(S.depthTexture);K.__renderTarget=S,(!K.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),U(S.depthTexture,0);const te=K.__webglTexture,q=se(S);if(S.depthTexture.format===Nr)le(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0);else if(S.depthTexture.format===Or)le(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function ze(C){const S=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){const K=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),K){const te=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,K.removeEventListener("dispose",te)};K.addEventListener("dispose",te),S.__depthDisposeCallback=te}S.__boundDepthTexture=K}if(C.depthTexture&&!S.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");const K=C.texture.mipmaps;K&&K.length>0?Ie(S.__webglFramebuffer[0],C):Ie(S.__webglFramebuffer,C)}else if(B){S.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[K]),S.__webglDepthbuffer[K]===void 0)S.__webglDepthbuffer[K]=i.createRenderbuffer(),pe(S.__webglDepthbuffer[K],C,!1);else{const te=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=S.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,q)}}else{const K=C.texture.mipmaps;if(K&&K.length>0?t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),pe(S.__webglDepthbuffer,C,!1);else{const te=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,te,i.RENDERBUFFER,q)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(C,S,B){const K=n.get(C);S!==void 0&&be(K.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&ze(C)}function He(C){const S=C.texture,B=n.get(C),K=n.get(S);C.addEventListener("dispose",A);const te=C.textures,q=C.isWebGLCubeRenderTarget===!0,ne=te.length>1;if(ne||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=S.version,o.memory.textures++),q){B.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer[Q]=[];for(let Te=0;Te<S.mipmaps.length;Te++)B.__webglFramebuffer[Q][Te]=i.createFramebuffer()}else B.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer=[];for(let Q=0;Q<S.mipmaps.length;Q++)B.__webglFramebuffer[Q]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ne)for(let Q=0,Te=te.length;Q<Te;Q++){const Ne=n.get(te[Q]);Ne.__webglTexture===void 0&&(Ne.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&le(C)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Q=0;Q<te.length;Q++){const Te=te[Q];B.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[Q]);const Ne=r.convert(Te.format,Te.colorSpace),ae=r.convert(Te.type),Se=y(Te.internalFormat,Ne,ae,Te.colorSpace,C.isXRRenderTarget===!0),Oe=se(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,Oe,Se,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,B.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),pe(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),De(i.TEXTURE_CUBE_MAP,S);for(let Q=0;Q<6;Q++)if(S.mipmaps&&S.mipmaps.length>0)for(let Te=0;Te<S.mipmaps.length;Te++)be(B.__webglFramebuffer[Q][Te],C,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Te);else be(B.__webglFramebuffer[Q],C,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);m(S)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ne){for(let Q=0,Te=te.length;Q<Te;Q++){const Ne=te[Q],ae=n.get(Ne);t.bindTexture(i.TEXTURE_2D,ae.__webglTexture),De(i.TEXTURE_2D,Ne),be(B.__webglFramebuffer,C,Ne,i.COLOR_ATTACHMENT0+Q,i.TEXTURE_2D,0),m(Ne)&&p(i.TEXTURE_2D)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,K.__webglTexture),De(Q,S),S.mipmaps&&S.mipmaps.length>0)for(let Te=0;Te<S.mipmaps.length;Te++)be(B.__webglFramebuffer[Te],C,S,i.COLOR_ATTACHMENT0,Q,Te);else be(B.__webglFramebuffer,C,S,i.COLOR_ATTACHMENT0,Q,0);m(S)&&p(Q),t.unbindTexture()}C.depthBuffer&&ze(C)}function Je(C){const S=C.textures;for(let B=0,K=S.length;B<K;B++){const te=S[B];if(m(te)){const q=E(C),ne=n.get(te).__webglTexture;t.bindTexture(q,ne),p(q),t.unbindTexture()}}}const Le=[],w=[];function de(C){if(C.samples>0){if(le(C)===!1){const S=C.textures,B=C.width,K=C.height;let te=i.COLOR_BUFFER_BIT;const q=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=n.get(C),Q=S.length>1;if(Q)for(let Ne=0;Ne<S.length;Ne++)t.bindFramebuffer(i.FRAMEBUFFER,ne.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ne.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ne.__webglMultisampledFramebuffer);const Te=C.texture.mipmaps;Te&&Te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ne.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ne.__webglFramebuffer);for(let Ne=0;Ne<S.length;Ne++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(te|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(te|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ne.__webglColorRenderbuffer[Ne]);const ae=n.get(S[Ne]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ae,0)}i.blitFramebuffer(0,0,B,K,0,0,B,K,te,i.NEAREST),c===!0&&(Le.length=0,w.length=0,Le.push(i.COLOR_ATTACHMENT0+Ne),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Le.push(q),w.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,w)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Le))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let Ne=0;Ne<S.length;Ne++){t.bindFramebuffer(i.FRAMEBUFFER,ne.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,ne.__webglColorRenderbuffer[Ne]);const ae=n.get(S[Ne]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ne.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,ae,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ne.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){const S=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function se(C){return Math.min(s.maxSamples,C.samples)}function le(C){const S=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function J(C){const S=o.render.frame;h.get(C)!==S&&(h.set(C,S),C.update())}function ge(C,S){const B=C.colorSpace,K=C.format,te=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==qs&&B!==Ti&&(ot.getTransfer(B)===dt?(K!==Bn||te!==qn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),S}function re(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=G,this.resetTextureUnits=V,this.setTexture2D=U,this.setTexture2DArray=F,this.setTexture3D=W,this.setTextureCube=N,this.rebindTextures=Ue,this.setupRenderTarget=He,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=ze,this.setupFrameBufferTexture=be,this.useMultisampledRTT=le}function ey(i,e){function t(n,s=Ti){let r;const o=ot.getTransfer(s);if(n===qn)return i.UNSIGNED_BYTE;if(n===Ml)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Sl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$u)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Wu)return i.BYTE;if(n===Xu)return i.SHORT;if(n===Lr)return i.UNSIGNED_SHORT;if(n===yl)return i.INT;if(n===ts)return i.UNSIGNED_INT;if(n===ci)return i.FLOAT;if(n===Qs)return i.HALF_FLOAT;if(n===qu)return i.ALPHA;if(n===Yu)return i.RGB;if(n===Bn)return i.RGBA;if(n===Nr)return i.DEPTH_COMPONENT;if(n===Or)return i.DEPTH_STENCIL;if(n===ju)return i.RED;if(n===El)return i.RED_INTEGER;if(n===Ku)return i.RG;if(n===Tl)return i.RG_INTEGER;if(n===bl)return i.RGBA_INTEGER;if(n===Ao||n===Ro||n===Po||n===Do)if(o===dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ao)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Do)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ao)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ro)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Po)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Do)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===gc||n===_c||n===vc||n===xc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===gc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===_c)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===vc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===xc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===yc||n===Mc||n===Sc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===yc||n===Mc)return o===dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Sc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ec||n===Tc||n===bc||n===wc||n===Cc||n===Ac||n===Rc||n===Pc||n===Dc||n===Ic||n===Lc||n===Uc||n===Nc||n===Oc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ec)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Tc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===bc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===wc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Cc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ac)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Rc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Pc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Dc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ic)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Lc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Uc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Nc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Oc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Io||n===Fc||n===zc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Io)return o===dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Fc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===zc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Zu||n===Bc||n===kc||n===Hc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Io)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Bc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===kc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Hc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ur?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const ty=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ny=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class iy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new on,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new jn({vertexShader:ty,fragmentShader:ny,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new H(new Kt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class sy extends er{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,f=null,d=null,g=null;const v=new iy,m=t.getContextAttributes();let p=null,E=null;const y=[],x=[],D=new ee;let R=null;const A=new un;A.viewport=new gt;const I=new un;I.viewport=new gt;const T=[A,I],M=new T0;let L=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ce=y[Y];return ce===void 0&&(ce=new Oa,y[Y]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(Y){let ce=y[Y];return ce===void 0&&(ce=new Oa,y[Y]=ce),ce.getGripSpace()},this.getHand=function(Y){let ce=y[Y];return ce===void 0&&(ce=new Oa,y[Y]=ce),ce.getHandSpace()};function G(Y){const ce=x.indexOf(Y.inputSource);if(ce===-1)return;const be=y[ce];be!==void 0&&(be.update(Y.inputSource,Y.frame,l||o),be.dispatchEvent({type:Y.type,data:Y.inputSource}))}function j(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",j),s.removeEventListener("inputsourceschange",U);for(let Y=0;Y<y.length;Y++){const ce=x[Y];ce!==null&&(x[Y]=null,y[Y].disconnect(ce))}L=null,V=null,v.reset(),e.setRenderTarget(p),d=null,f=null,u=null,s=null,E=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",j),s.addEventListener("inputsourceschange",U),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(D),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let be=null,pe=null,Ie=null;m.depth&&(Ie=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,be=m.stencil?Or:Nr,pe=m.stencil?Ur:ts);const ze={colorFormat:t.RGBA8,depthFormat:Ie,scaleFactor:r};u=new XRWebGLBinding(s,t),f=u.createProjectionLayer(ze),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),E=new Pi(f.textureWidth,f.textureHeight,{format:Bn,type:qn,depthTexture:new df(f.textureWidth,f.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,be),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const be={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,be),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),E=new Pi(d.framebufferWidth,d.framebufferHeight,{format:Bn,type:qn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),$e.setContext(s),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function U(Y){for(let ce=0;ce<Y.removed.length;ce++){const be=Y.removed[ce],pe=x.indexOf(be);pe>=0&&(x[pe]=null,y[pe].disconnect(be))}for(let ce=0;ce<Y.added.length;ce++){const be=Y.added[ce];let pe=x.indexOf(be);if(pe===-1){for(let ze=0;ze<y.length;ze++)if(ze>=x.length){x.push(be),pe=ze;break}else if(x[ze]===null){x[ze]=be,pe=ze;break}if(pe===-1)break}const Ie=y[pe];Ie&&Ie.connect(be)}}const F=new P,W=new P;function N(Y,ce,be){F.setFromMatrixPosition(ce.matrixWorld),W.setFromMatrixPosition(be.matrixWorld);const pe=F.distanceTo(W),Ie=ce.projectionMatrix.elements,ze=be.projectionMatrix.elements,Ue=Ie[14]/(Ie[10]-1),He=Ie[14]/(Ie[10]+1),Je=(Ie[9]+1)/Ie[5],Le=(Ie[9]-1)/Ie[5],w=(Ie[8]-1)/Ie[0],de=(ze[8]+1)/ze[0],se=Ue*w,le=Ue*de,J=pe/(-w+de),ge=J*-w;if(ce.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(ge),Y.translateZ(J),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Ie[10]===-1)Y.projectionMatrix.copy(ce.projectionMatrix),Y.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{const re=Ue+J,C=He+J,S=se-ge,B=le+(pe-ge),K=Je*He/C*re,te=Le*He/C*re;Y.projectionMatrix.makePerspective(S,B,K,te,re,C),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function oe(Y,ce){ce===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ce.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let ce=Y.near,be=Y.far;v.texture!==null&&(v.depthNear>0&&(ce=v.depthNear),v.depthFar>0&&(be=v.depthFar)),M.near=I.near=A.near=ce,M.far=I.far=A.far=be,(L!==M.near||V!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),L=M.near,V=M.far),A.layers.mask=Y.layers.mask|2,I.layers.mask=Y.layers.mask|4,M.layers.mask=A.layers.mask|I.layers.mask;const pe=Y.parent,Ie=M.cameras;oe(M,pe);for(let ze=0;ze<Ie.length;ze++)oe(Ie[ze],pe);Ie.length===2?N(M,A,I):M.projectionMatrix.copy(A.projectionMatrix),fe(Y,M,pe)};function fe(Y,ce,be){be===null?Y.matrix.copy(ce.matrixWorld):(Y.matrix.copy(be.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ce.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ce.projectionMatrix),Y.projectionMatrixInverse.copy(ce.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Ys*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(f===null&&d===null))return c},this.setFoveation=function(Y){c=Y,f!==null&&(f.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(M)};let ve=null;function De(Y,ce){if(h=ce.getViewerPose(l||o),g=ce,h!==null){const be=h.views;d!==null&&(e.setRenderTargetFramebuffer(E,d.framebuffer),e.setRenderTarget(E));let pe=!1;be.length!==M.cameras.length&&(M.cameras.length=0,pe=!0);for(let Ue=0;Ue<be.length;Ue++){const He=be[Ue];let Je=null;if(d!==null)Je=d.getViewport(He);else{const w=u.getViewSubImage(f,He);Je=w.viewport,Ue===0&&(e.setRenderTargetTextures(E,w.colorTexture,w.depthStencilTexture),e.setRenderTarget(E))}let Le=T[Ue];Le===void 0&&(Le=new un,Le.layers.enable(Ue),Le.viewport=new gt,T[Ue]=Le),Le.matrix.fromArray(He.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(He.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Je.x,Je.y,Je.width,Je.height),Ue===0&&(M.matrix.copy(Le.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),pe===!0&&M.cameras.push(Le)}const Ie=s.enabledFeatures;if(Ie&&Ie.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&u){const Ue=u.getDepthInformation(be[0]);Ue&&Ue.isValid&&Ue.texture&&v.init(e,Ue,s.renderState)}}for(let be=0;be<y.length;be++){const pe=x[be],Ie=y[be];pe!==null&&Ie!==void 0&&Ie.update(pe,ce,l||o)}ve&&ve(Y,ce),ce.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ce}),g=null}const $e=new Tf;$e.setAnimationLoop(De),this.setAnimationLoop=function(Y){ve=Y},this.dispose=function(){}}}const Hi=new Yn,ry=new _t;function oy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,of(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,E,y,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,x)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,E,y):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===dn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===dn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p),y=E.envMap,x=E.envMapRotation;y&&(m.envMap.value=y,Hi.copy(x),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),m.envMapRotation.value.setFromMatrix4(ry.makeRotationFromEuler(Hi)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,E,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===dn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ay(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,y){const x=y.program;n.uniformBlockBinding(E,x)}function l(E,y){let x=s[E.id];x===void 0&&(g(E),x=h(E),s[E.id]=x,E.addEventListener("dispose",m));const D=y.program;n.updateUBOMapping(E,D);const R=e.render.frame;r[E.id]!==R&&(f(E),r[E.id]=R)}function h(E){const y=u();E.__bindingPointIndex=y;const x=i.createBuffer(),D=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,D,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,x),x}function u(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){const y=s[E.id],x=E.uniforms,D=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let R=0,A=x.length;R<A;R++){const I=Array.isArray(x[R])?x[R]:[x[R]];for(let T=0,M=I.length;T<M;T++){const L=I[T];if(d(L,R,T,D)===!0){const V=L.__offset,G=Array.isArray(L.value)?L.value:[L.value];let j=0;for(let U=0;U<G.length;U++){const F=G[U],W=v(F);typeof F=="number"||typeof F=="boolean"?(L.__data[0]=F,i.bufferSubData(i.UNIFORM_BUFFER,V+j,L.__data)):F.isMatrix3?(L.__data[0]=F.elements[0],L.__data[1]=F.elements[1],L.__data[2]=F.elements[2],L.__data[3]=0,L.__data[4]=F.elements[3],L.__data[5]=F.elements[4],L.__data[6]=F.elements[5],L.__data[7]=0,L.__data[8]=F.elements[6],L.__data[9]=F.elements[7],L.__data[10]=F.elements[8],L.__data[11]=0):(F.toArray(L.__data,j),j+=W.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,V,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(E,y,x,D){const R=E.value,A=y+"_"+x;if(D[A]===void 0)return typeof R=="number"||typeof R=="boolean"?D[A]=R:D[A]=R.clone(),!0;{const I=D[A];if(typeof R=="number"||typeof R=="boolean"){if(I!==R)return D[A]=R,!0}else if(I.equals(R)===!1)return I.copy(R),!0}return!1}function g(E){const y=E.uniforms;let x=0;const D=16;for(let A=0,I=y.length;A<I;A++){const T=Array.isArray(y[A])?y[A]:[y[A]];for(let M=0,L=T.length;M<L;M++){const V=T[M],G=Array.isArray(V.value)?V.value:[V.value];for(let j=0,U=G.length;j<U;j++){const F=G[j],W=v(F),N=x%D,oe=N%W.boundary,fe=N+oe;x+=oe,fe!==0&&D-fe<W.storage&&(x+=D-fe),V.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=x,x+=W.storage}}}const R=x%D;return R>0&&(x+=D-R),E.__size=x,E.__cache={},this}function v(E){const y={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(y.boundary=4,y.storage=4):E.isVector2?(y.boundary=8,y.storage=8):E.isVector3||E.isColor?(y.boundary=16,y.storage=12):E.isVector4?(y.boundary=16,y.storage=16):E.isMatrix3?(y.boundary=48,y.storage=48):E.isMatrix4?(y.boundary=64,y.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),y}function m(E){const y=E.target;y.removeEventListener("dispose",m);const x=o.indexOf(y.__bindingPointIndex);o.splice(x,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:c,update:l,dispose:p}}class cy{constructor(e={}){const{canvas:t=om(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const E=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=wi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let D=!1;this._outputColorSpace=_n;let R=0,A=0,I=null,T=-1,M=null;const L=new gt,V=new gt;let G=null;const j=new Ae(0);let U=0,F=t.width,W=t.height,N=1,oe=null,fe=null;const ve=new gt(0,0,F,W),De=new gt(0,0,F,W);let $e=!1;const Y=new Pl;let ce=!1,be=!1;const pe=new _t,Ie=new _t,ze=new P,Ue=new gt,He={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function Le(){return I===null?N:1}let w=n;function de(b,z){return t.getContext(b,z)}try{const b={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${xl}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",Ee,!1),t.addEventListener("webglcontextcreationerror",ye,!1),w===null){const z="webgl2";if(w=de(z,b),w===null)throw de(z)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let se,le,J,ge,re,C,S,B,K,te,q,ne,Q,Te,Ne,ae,Se,Oe,Ge,we,tt,Ke,xt,O;function xe(){se=new vv(w),se.init(),Ke=new ey(w,se),le=new uv(w,se,e,Ke),J=new Jx(w,se),le.reverseDepthBuffer&&f&&J.buffers.depth.setReversed(!0),ge=new Mv(w),re=new Bx,C=new Qx(w,se,J,re,le,Ke,ge),S=new dv(x),B=new _v(x),K=new C0(w),xt=new lv(w,K),te=new xv(w,K,ge,xt),q=new Ev(w,te,K,ge),Ge=new Sv(w,le,C),ae=new fv(re),ne=new zx(x,S,B,se,le,xt,ae),Q=new oy(x,re),Te=new Hx,Ne=new qx(se),Oe=new cv(x,S,B,J,q,d,c),Se=new Kx(x,q,le),O=new ay(w,ge,le,J),we=new hv(w,se,ge),tt=new yv(w,se,ge),ge.programs=ne.programs,x.capabilities=le,x.extensions=se,x.properties=re,x.renderLists=Te,x.shadowMap=Se,x.state=J,x.info=ge}xe();const Z=new sy(x,w);this.xr=Z,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){const b=se.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=se.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(b){b!==void 0&&(N=b,this.setSize(F,W,!1))},this.getSize=function(b){return b.set(F,W)},this.setSize=function(b,z,X=!0){if(Z.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=b,W=z,t.width=Math.floor(b*N),t.height=Math.floor(z*N),X===!0&&(t.style.width=b+"px",t.style.height=z+"px"),this.setViewport(0,0,b,z)},this.getDrawingBufferSize=function(b){return b.set(F*N,W*N).floor()},this.setDrawingBufferSize=function(b,z,X){F=b,W=z,N=X,t.width=Math.floor(b*X),t.height=Math.floor(z*X),this.setViewport(0,0,b,z)},this.getCurrentViewport=function(b){return b.copy(L)},this.getViewport=function(b){return b.copy(ve)},this.setViewport=function(b,z,X,$){b.isVector4?ve.set(b.x,b.y,b.z,b.w):ve.set(b,z,X,$),J.viewport(L.copy(ve).multiplyScalar(N).round())},this.getScissor=function(b){return b.copy(De)},this.setScissor=function(b,z,X,$){b.isVector4?De.set(b.x,b.y,b.z,b.w):De.set(b,z,X,$),J.scissor(V.copy(De).multiplyScalar(N).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(b){J.setScissorTest($e=b)},this.setOpaqueSort=function(b){oe=b},this.setTransparentSort=function(b){fe=b},this.getClearColor=function(b){return b.copy(Oe.getClearColor())},this.setClearColor=function(){Oe.setClearColor(...arguments)},this.getClearAlpha=function(){return Oe.getClearAlpha()},this.setClearAlpha=function(){Oe.setClearAlpha(...arguments)},this.clear=function(b=!0,z=!0,X=!0){let $=0;if(b){let k=!1;if(I!==null){const he=I.texture.format;k=he===bl||he===Tl||he===El}if(k){const he=I.texture.type,_e=he===qn||he===ts||he===Lr||he===Ur||he===Ml||he===Sl,Ce=Oe.getClearColor(),Re=Oe.getClearAlpha(),We=Ce.r,Ve=Ce.g,Be=Ce.b;_e?(g[0]=We,g[1]=Ve,g[2]=Be,g[3]=Re,w.clearBufferuiv(w.COLOR,0,g)):(v[0]=We,v[1]=Ve,v[2]=Be,v[3]=Re,w.clearBufferiv(w.COLOR,0,v))}else $|=w.COLOR_BUFFER_BIT}z&&($|=w.DEPTH_BUFFER_BIT),X&&($|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),w.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",Ee,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),Oe.dispose(),Te.dispose(),Ne.dispose(),re.dispose(),S.dispose(),B.dispose(),q.dispose(),xt.dispose(),O.dispose(),ne.dispose(),Z.dispose(),Z.removeEventListener("sessionstart",Jl),Z.removeEventListener("sessionend",Ql),Ui.stop()};function ie(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function Ee(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const b=ge.autoReset,z=Se.enabled,X=Se.autoUpdate,$=Se.needsUpdate,k=Se.type;xe(),ge.autoReset=b,Se.enabled=z,Se.autoUpdate=X,Se.needsUpdate=$,Se.type=k}function ye(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function qe(b){const z=b.target;z.removeEventListener("dispose",qe),Rt(z)}function Rt(b){$t(b),re.remove(b)}function $t(b){const z=re.get(b).programs;z!==void 0&&(z.forEach(function(X){ne.releaseProgram(X)}),b.isShaderMaterial&&ne.releaseShaderCache(b))}this.renderBufferDirect=function(b,z,X,$,k,he){z===null&&(z=He);const _e=k.isMesh&&k.matrixWorld.determinant()<0,Ce=Zd(b,z,X,$,k);J.setMaterial($,_e);let Re=X.index,We=1;if($.wireframe===!0){if(Re=te.getWireframeAttribute(X),Re===void 0)return;We=2}const Ve=X.drawRange,Be=X.attributes.position;let it=Ve.start*We,at=(Ve.start+Ve.count)*We;he!==null&&(it=Math.max(it,he.start*We),at=Math.min(at,(he.start+he.count)*We)),Re!==null?(it=Math.max(it,0),at=Math.min(at,Re.count)):Be!=null&&(it=Math.max(it,0),at=Math.min(at,Be.count));const Dt=at-it;if(Dt<0||Dt===1/0)return;xt.setup(k,$,Ce,X,Re);let Pt,rt=we;if(Re!==null&&(Pt=K.get(Re),rt=tt,rt.setIndex(Pt)),k.isMesh)$.wireframe===!0?(J.setLineWidth($.wireframeLinewidth*Le()),rt.setMode(w.LINES)):rt.setMode(w.TRIANGLES);else if(k.isLine){let ke=$.linewidth;ke===void 0&&(ke=1),J.setLineWidth(ke*Le()),k.isLineSegments?rt.setMode(w.LINES):k.isLineLoop?rt.setMode(w.LINE_LOOP):rt.setMode(w.LINE_STRIP)}else k.isPoints?rt.setMode(w.POINTS):k.isSprite&&rt.setMode(w.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)Lo("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),rt.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(se.get("WEBGL_multi_draw"))rt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const ke=k._multiDrawStarts,Wt=k._multiDrawCounts,ct=k._multiDrawCount,Pn=Re?K.get(Re).bytesPerElement:1,cs=re.get($).currentProgram.getUniforms();for(let pn=0;pn<ct;pn++)cs.setValue(w,"_gl_DrawID",pn),rt.render(ke[pn]/Pn,Wt[pn])}else if(k.isInstancedMesh)rt.renderInstances(it,Dt,k.count);else if(X.isInstancedBufferGeometry){const ke=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Wt=Math.min(X.instanceCount,ke);rt.renderInstances(it,Dt,Wt)}else rt.render(it,Dt)};function lt(b,z,X){b.transparent===!0&&b.side===Mt&&b.forceSinglePass===!1?(b.side=dn,b.needsUpdate=!0,Yr(b,z,X),b.side=Ri,b.needsUpdate=!0,Yr(b,z,X),b.side=Mt):Yr(b,z,X)}this.compile=function(b,z,X=null){X===null&&(X=b),p=Ne.get(X),p.init(z),y.push(p),X.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),b!==X&&b.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights();const $=new Set;return b.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const he=k.material;if(he)if(Array.isArray(he))for(let _e=0;_e<he.length;_e++){const Ce=he[_e];lt(Ce,X,k),$.add(Ce)}else lt(he,X,k),$.add(he)}),p=y.pop(),$},this.compileAsync=function(b,z,X=null){const $=this.compile(b,z,X);return new Promise(k=>{function he(){if($.forEach(function(_e){re.get(_e).currentProgram.isReady()&&$.delete(_e)}),$.size===0){k(b);return}setTimeout(he,10)}se.get("KHR_parallel_shader_compile")!==null?he():setTimeout(he,10)})};let Rn=null;function Jn(b){Rn&&Rn(b)}function Jl(){Ui.stop()}function Ql(){Ui.start()}const Ui=new Tf;Ui.setAnimationLoop(Jn),typeof self<"u"&&Ui.setContext(self),this.setAnimationLoop=function(b){Rn=b,Z.setAnimationLoop(b),b===null?Ui.stop():Ui.start()},Z.addEventListener("sessionstart",Jl),Z.addEventListener("sessionend",Ql),this.render=function(b,z){if(z!==void 0&&z.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Z.enabled===!0&&Z.isPresenting===!0&&(Z.cameraAutoUpdate===!0&&Z.updateCamera(z),z=Z.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,z,I),p=Ne.get(b,y.length),p.init(z),y.push(p),Ie.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),Y.setFromProjectionMatrix(Ie),be=this.localClippingEnabled,ce=ae.init(this.clippingPlanes,be),m=Te.get(b,E.length),m.init(),E.push(m),Z.enabled===!0&&Z.isPresenting===!0){const he=x.xr.getDepthSensingMesh();he!==null&&pa(he,z,-1/0,x.sortObjects)}pa(b,z,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(oe,fe),Je=Z.enabled===!1||Z.isPresenting===!1||Z.hasDepthSensing()===!1,Je&&Oe.addToRenderList(m,b),this.info.render.frame++,ce===!0&&ae.beginShadows();const X=p.state.shadowsArray;Se.render(X,b,z),ce===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();const $=m.opaque,k=m.transmissive;if(p.setupLights(),z.isArrayCamera){const he=z.cameras;if(k.length>0)for(let _e=0,Ce=he.length;_e<Ce;_e++){const Re=he[_e];th($,k,b,Re)}Je&&Oe.render(b);for(let _e=0,Ce=he.length;_e<Ce;_e++){const Re=he[_e];eh(m,b,Re,Re.viewport)}}else k.length>0&&th($,k,b,z),Je&&Oe.render(b),eh(m,b,z);I!==null&&A===0&&(C.updateMultisampleRenderTarget(I),C.updateRenderTargetMipmap(I)),b.isScene===!0&&b.onAfterRender(x,b,z),xt.resetDefaultState(),T=-1,M=null,y.pop(),y.length>0?(p=y[y.length-1],ce===!0&&ae.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function pa(b,z,X,$){if(b.visible===!1)return;if(b.layers.test(z.layers)){if(b.isGroup)X=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(z);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Y.intersectsSprite(b)){$&&Ue.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Ie);const _e=q.update(b),Ce=b.material;Ce.visible&&m.push(b,_e,Ce,X,Ue.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Y.intersectsObject(b))){const _e=q.update(b),Ce=b.material;if($&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ue.copy(b.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Ue.copy(_e.boundingSphere.center)),Ue.applyMatrix4(b.matrixWorld).applyMatrix4(Ie)),Array.isArray(Ce)){const Re=_e.groups;for(let We=0,Ve=Re.length;We<Ve;We++){const Be=Re[We],it=Ce[Be.materialIndex];it&&it.visible&&m.push(b,_e,it,X,Ue.z,Be)}}else Ce.visible&&m.push(b,_e,Ce,X,Ue.z,null)}}const he=b.children;for(let _e=0,Ce=he.length;_e<Ce;_e++)pa(he[_e],z,X,$)}function eh(b,z,X,$){const k=b.opaque,he=b.transmissive,_e=b.transparent;p.setupLightsView(X),ce===!0&&ae.setGlobalState(x.clippingPlanes,X),$&&J.viewport(L.copy($)),k.length>0&&qr(k,z,X),he.length>0&&qr(he,z,X),_e.length>0&&qr(_e,z,X),J.buffers.depth.setTest(!0),J.buffers.depth.setMask(!0),J.buffers.color.setMask(!0),J.setPolygonOffset(!1)}function th(b,z,X,$){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[$.id]===void 0&&(p.state.transmissionRenderTarget[$.id]=new Pi(1,1,{generateMipmaps:!0,type:se.has("EXT_color_buffer_half_float")||se.has("EXT_color_buffer_float")?Qs:qn,minFilter:Ki,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace}));const he=p.state.transmissionRenderTarget[$.id],_e=$.viewport||L;he.setSize(_e.z*x.transmissionResolutionScale,_e.w*x.transmissionResolutionScale);const Ce=x.getRenderTarget();x.setRenderTarget(he),x.getClearColor(j),U=x.getClearAlpha(),U<1&&x.setClearColor(16777215,.5),x.clear(),Je&&Oe.render(X);const Re=x.toneMapping;x.toneMapping=wi;const We=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),p.setupLightsView($),ce===!0&&ae.setGlobalState(x.clippingPlanes,$),qr(b,X,$),C.updateMultisampleRenderTarget(he),C.updateRenderTargetMipmap(he),se.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let Be=0,it=z.length;Be<it;Be++){const at=z[Be],Dt=at.object,Pt=at.geometry,rt=at.material,ke=at.group;if(rt.side===Mt&&Dt.layers.test($.layers)){const Wt=rt.side;rt.side=dn,rt.needsUpdate=!0,nh(Dt,X,$,Pt,rt,ke),rt.side=Wt,rt.needsUpdate=!0,Ve=!0}}Ve===!0&&(C.updateMultisampleRenderTarget(he),C.updateRenderTargetMipmap(he))}x.setRenderTarget(Ce),x.setClearColor(j,U),We!==void 0&&($.viewport=We),x.toneMapping=Re}function qr(b,z,X){const $=z.isScene===!0?z.overrideMaterial:null;for(let k=0,he=b.length;k<he;k++){const _e=b[k],Ce=_e.object,Re=_e.geometry,We=_e.group;let Ve=_e.material;Ve.allowOverride===!0&&$!==null&&(Ve=$),Ce.layers.test(X.layers)&&nh(Ce,z,X,Re,Ve,We)}}function nh(b,z,X,$,k,he){b.onBeforeRender(x,z,X,$,k,he),b.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),k.onBeforeRender(x,z,X,$,b,he),k.transparent===!0&&k.side===Mt&&k.forceSinglePass===!1?(k.side=dn,k.needsUpdate=!0,x.renderBufferDirect(X,z,$,k,b,he),k.side=Ri,k.needsUpdate=!0,x.renderBufferDirect(X,z,$,k,b,he),k.side=Mt):x.renderBufferDirect(X,z,$,k,b,he),b.onAfterRender(x,z,X,$,k,he)}function Yr(b,z,X){z.isScene!==!0&&(z=He);const $=re.get(b),k=p.state.lights,he=p.state.shadowsArray,_e=k.state.version,Ce=ne.getParameters(b,k.state,he,z,X),Re=ne.getProgramCacheKey(Ce);let We=$.programs;$.environment=b.isMeshStandardMaterial?z.environment:null,$.fog=z.fog,$.envMap=(b.isMeshStandardMaterial?B:S).get(b.envMap||$.environment),$.envMapRotation=$.environment!==null&&b.envMap===null?z.environmentRotation:b.envMapRotation,We===void 0&&(b.addEventListener("dispose",qe),We=new Map,$.programs=We);let Ve=We.get(Re);if(Ve!==void 0){if($.currentProgram===Ve&&$.lightsStateVersion===_e)return sh(b,Ce),Ve}else Ce.uniforms=ne.getUniforms(b),b.onBeforeCompile(Ce,x),Ve=ne.acquireProgram(Ce,Re),We.set(Re,Ve),$.uniforms=Ce.uniforms;const Be=$.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Be.clippingPlanes=ae.uniform),sh(b,Ce),$.needsLights=Qd(b),$.lightsStateVersion=_e,$.needsLights&&(Be.ambientLightColor.value=k.state.ambient,Be.lightProbe.value=k.state.probe,Be.directionalLights.value=k.state.directional,Be.directionalLightShadows.value=k.state.directionalShadow,Be.spotLights.value=k.state.spot,Be.spotLightShadows.value=k.state.spotShadow,Be.rectAreaLights.value=k.state.rectArea,Be.ltc_1.value=k.state.rectAreaLTC1,Be.ltc_2.value=k.state.rectAreaLTC2,Be.pointLights.value=k.state.point,Be.pointLightShadows.value=k.state.pointShadow,Be.hemisphereLights.value=k.state.hemi,Be.directionalShadowMap.value=k.state.directionalShadowMap,Be.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Be.spotShadowMap.value=k.state.spotShadowMap,Be.spotLightMatrix.value=k.state.spotLightMatrix,Be.spotLightMap.value=k.state.spotLightMap,Be.pointShadowMap.value=k.state.pointShadowMap,Be.pointShadowMatrix.value=k.state.pointShadowMatrix),$.currentProgram=Ve,$.uniformsList=null,Ve}function ih(b){if(b.uniformsList===null){const z=b.currentProgram.getUniforms();b.uniformsList=Uo.seqWithValue(z.seq,b.uniforms)}return b.uniformsList}function sh(b,z){const X=re.get(b);X.outputColorSpace=z.outputColorSpace,X.batching=z.batching,X.batchingColor=z.batchingColor,X.instancing=z.instancing,X.instancingColor=z.instancingColor,X.instancingMorph=z.instancingMorph,X.skinning=z.skinning,X.morphTargets=z.morphTargets,X.morphNormals=z.morphNormals,X.morphColors=z.morphColors,X.morphTargetsCount=z.morphTargetsCount,X.numClippingPlanes=z.numClippingPlanes,X.numIntersection=z.numClipIntersection,X.vertexAlphas=z.vertexAlphas,X.vertexTangents=z.vertexTangents,X.toneMapping=z.toneMapping}function Zd(b,z,X,$,k){z.isScene!==!0&&(z=He),C.resetTextureUnits();const he=z.fog,_e=$.isMeshStandardMaterial?z.environment:null,Ce=I===null?x.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:qs,Re=($.isMeshStandardMaterial?B:S).get($.envMap||_e),We=$.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Ve=!!X.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),Be=!!X.morphAttributes.position,it=!!X.morphAttributes.normal,at=!!X.morphAttributes.color;let Dt=wi;$.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(Dt=x.toneMapping);const Pt=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,rt=Pt!==void 0?Pt.length:0,ke=re.get($),Wt=p.state.lights;if(ce===!0&&(be===!0||b!==M)){const en=b===M&&$.id===T;ae.setState($,b,en)}let ct=!1;$.version===ke.__version?(ke.needsLights&&ke.lightsStateVersion!==Wt.state.version||ke.outputColorSpace!==Ce||k.isBatchedMesh&&ke.batching===!1||!k.isBatchedMesh&&ke.batching===!0||k.isBatchedMesh&&ke.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&ke.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&ke.instancing===!1||!k.isInstancedMesh&&ke.instancing===!0||k.isSkinnedMesh&&ke.skinning===!1||!k.isSkinnedMesh&&ke.skinning===!0||k.isInstancedMesh&&ke.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&ke.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&ke.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&ke.instancingMorph===!1&&k.morphTexture!==null||ke.envMap!==Re||$.fog===!0&&ke.fog!==he||ke.numClippingPlanes!==void 0&&(ke.numClippingPlanes!==ae.numPlanes||ke.numIntersection!==ae.numIntersection)||ke.vertexAlphas!==We||ke.vertexTangents!==Ve||ke.morphTargets!==Be||ke.morphNormals!==it||ke.morphColors!==at||ke.toneMapping!==Dt||ke.morphTargetsCount!==rt)&&(ct=!0):(ct=!0,ke.__version=$.version);let Pn=ke.currentProgram;ct===!0&&(Pn=Yr($,z,k));let cs=!1,pn=!1,or=!1;const Tt=Pn.getUniforms(),yn=ke.uniforms;if(J.useProgram(Pn.program)&&(cs=!0,pn=!0,or=!0),$.id!==T&&(T=$.id,pn=!0),cs||M!==b){J.buffers.depth.getReversed()?(pe.copy(b.projectionMatrix),cm(pe),lm(pe),Tt.setValue(w,"projectionMatrix",pe)):Tt.setValue(w,"projectionMatrix",b.projectionMatrix),Tt.setValue(w,"viewMatrix",b.matrixWorldInverse);const cn=Tt.map.cameraPosition;cn!==void 0&&cn.setValue(w,ze.setFromMatrixPosition(b.matrixWorld)),le.logarithmicDepthBuffer&&Tt.setValue(w,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&Tt.setValue(w,"isOrthographic",b.isOrthographicCamera===!0),M!==b&&(M=b,pn=!0,or=!0)}if(k.isSkinnedMesh){Tt.setOptional(w,k,"bindMatrix"),Tt.setOptional(w,k,"bindMatrixInverse");const en=k.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),Tt.setValue(w,"boneTexture",en.boneTexture,C))}k.isBatchedMesh&&(Tt.setOptional(w,k,"batchingTexture"),Tt.setValue(w,"batchingTexture",k._matricesTexture,C),Tt.setOptional(w,k,"batchingIdTexture"),Tt.setValue(w,"batchingIdTexture",k._indirectTexture,C),Tt.setOptional(w,k,"batchingColorTexture"),k._colorsTexture!==null&&Tt.setValue(w,"batchingColorTexture",k._colorsTexture,C));const Mn=X.morphAttributes;if((Mn.position!==void 0||Mn.normal!==void 0||Mn.color!==void 0)&&Ge.update(k,X,Pn),(pn||ke.receiveShadow!==k.receiveShadow)&&(ke.receiveShadow=k.receiveShadow,Tt.setValue(w,"receiveShadow",k.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(yn.envMap.value=Re,yn.flipEnvMap.value=Re.isCubeTexture&&Re.isRenderTargetTexture===!1?-1:1),$.isMeshStandardMaterial&&$.envMap===null&&z.environment!==null&&(yn.envMapIntensity.value=z.environmentIntensity),pn&&(Tt.setValue(w,"toneMappingExposure",x.toneMappingExposure),ke.needsLights&&Jd(yn,or),he&&$.fog===!0&&Q.refreshFogUniforms(yn,he),Q.refreshMaterialUniforms(yn,$,N,W,p.state.transmissionRenderTarget[b.id]),Uo.upload(w,ih(ke),yn,C)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(Uo.upload(w,ih(ke),yn,C),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&Tt.setValue(w,"center",k.center),Tt.setValue(w,"modelViewMatrix",k.modelViewMatrix),Tt.setValue(w,"normalMatrix",k.normalMatrix),Tt.setValue(w,"modelMatrix",k.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){const en=$.uniformsGroups;for(let cn=0,ma=en.length;cn<ma;cn++){const Ni=en[cn];O.update(Ni,Pn),O.bind(Ni,Pn)}}return Pn}function Jd(b,z){b.ambientLightColor.needsUpdate=z,b.lightProbe.needsUpdate=z,b.directionalLights.needsUpdate=z,b.directionalLightShadows.needsUpdate=z,b.pointLights.needsUpdate=z,b.pointLightShadows.needsUpdate=z,b.spotLights.needsUpdate=z,b.spotLightShadows.needsUpdate=z,b.rectAreaLights.needsUpdate=z,b.hemisphereLights.needsUpdate=z}function Qd(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(b,z,X){const $=re.get(b);$.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,$.__autoAllocateDepthBuffer===!1&&($.__useRenderToTexture=!1),re.get(b.texture).__webglTexture=z,re.get(b.depthTexture).__webglTexture=$.__autoAllocateDepthBuffer?void 0:X,$.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,z){const X=re.get(b);X.__webglFramebuffer=z,X.__useDefaultFramebuffer=z===void 0};const ep=w.createFramebuffer();this.setRenderTarget=function(b,z=0,X=0){I=b,R=z,A=X;let $=!0,k=null,he=!1,_e=!1;if(b){const Re=re.get(b);if(Re.__useDefaultFramebuffer!==void 0)J.bindFramebuffer(w.FRAMEBUFFER,null),$=!1;else if(Re.__webglFramebuffer===void 0)C.setupRenderTarget(b);else if(Re.__hasExternalTextures)C.rebindTextures(b,re.get(b.texture).__webglTexture,re.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Be=b.depthTexture;if(Re.__boundDepthTexture!==Be){if(Be!==null&&re.has(Be)&&(b.width!==Be.image.width||b.height!==Be.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(b)}}const We=b.texture;(We.isData3DTexture||We.isDataArrayTexture||We.isCompressedArrayTexture)&&(_e=!0);const Ve=re.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ve[z])?k=Ve[z][X]:k=Ve[z],he=!0):b.samples>0&&C.useMultisampledRTT(b)===!1?k=re.get(b).__webglMultisampledFramebuffer:Array.isArray(Ve)?k=Ve[X]:k=Ve,L.copy(b.viewport),V.copy(b.scissor),G=b.scissorTest}else L.copy(ve).multiplyScalar(N).floor(),V.copy(De).multiplyScalar(N).floor(),G=$e;if(X!==0&&(k=ep),J.bindFramebuffer(w.FRAMEBUFFER,k)&&$&&J.drawBuffers(b,k),J.viewport(L),J.scissor(V),J.setScissorTest(G),he){const Re=re.get(b.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+z,Re.__webglTexture,X)}else if(_e){const Re=re.get(b.texture),We=z;w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,Re.__webglTexture,X,We)}else if(b!==null&&X!==0){const Re=re.get(b.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Re.__webglTexture,X)}T=-1},this.readRenderTargetPixels=function(b,z,X,$,k,he,_e){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=re.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_e!==void 0&&(Ce=Ce[_e]),Ce){J.bindFramebuffer(w.FRAMEBUFFER,Ce);try{const Re=b.texture,We=Re.format,Ve=Re.type;if(!le.textureFormatReadable(We)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!le.textureTypeReadable(Ve)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=b.width-$&&X>=0&&X<=b.height-k&&w.readPixels(z,X,$,k,Ke.convert(We),Ke.convert(Ve),he)}finally{const Re=I!==null?re.get(I).__webglFramebuffer:null;J.bindFramebuffer(w.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(b,z,X,$,k,he,_e){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=re.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_e!==void 0&&(Ce=Ce[_e]),Ce)if(z>=0&&z<=b.width-$&&X>=0&&X<=b.height-k){J.bindFramebuffer(w.FRAMEBUFFER,Ce);const Re=b.texture,We=Re.format,Ve=Re.type;if(!le.textureFormatReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!le.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Be=w.createBuffer();w.bindBuffer(w.PIXEL_PACK_BUFFER,Be),w.bufferData(w.PIXEL_PACK_BUFFER,he.byteLength,w.STREAM_READ),w.readPixels(z,X,$,k,Ke.convert(We),Ke.convert(Ve),0);const it=I!==null?re.get(I).__webglFramebuffer:null;J.bindFramebuffer(w.FRAMEBUFFER,it);const at=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);return w.flush(),await am(w,at,4),w.bindBuffer(w.PIXEL_PACK_BUFFER,Be),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,he),w.deleteBuffer(Be),w.deleteSync(at),he}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,z=null,X=0){const $=Math.pow(2,-X),k=Math.floor(b.image.width*$),he=Math.floor(b.image.height*$),_e=z!==null?z.x:0,Ce=z!==null?z.y:0;C.setTexture2D(b,0),w.copyTexSubImage2D(w.TEXTURE_2D,X,0,0,_e,Ce,k,he),J.unbindTexture()};const tp=w.createFramebuffer(),np=w.createFramebuffer();this.copyTextureToTexture=function(b,z,X=null,$=null,k=0,he=null){he===null&&(k!==0?(Lo("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),he=k,k=0):he=0);let _e,Ce,Re,We,Ve,Be,it,at,Dt;const Pt=b.isCompressedTexture?b.mipmaps[he]:b.image;if(X!==null)_e=X.max.x-X.min.x,Ce=X.max.y-X.min.y,Re=X.isBox3?X.max.z-X.min.z:1,We=X.min.x,Ve=X.min.y,Be=X.isBox3?X.min.z:0;else{const Mn=Math.pow(2,-k);_e=Math.floor(Pt.width*Mn),Ce=Math.floor(Pt.height*Mn),b.isDataArrayTexture?Re=Pt.depth:b.isData3DTexture?Re=Math.floor(Pt.depth*Mn):Re=1,We=0,Ve=0,Be=0}$!==null?(it=$.x,at=$.y,Dt=$.z):(it=0,at=0,Dt=0);const rt=Ke.convert(z.format),ke=Ke.convert(z.type);let Wt;z.isData3DTexture?(C.setTexture3D(z,0),Wt=w.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(C.setTexture2DArray(z,0),Wt=w.TEXTURE_2D_ARRAY):(C.setTexture2D(z,0),Wt=w.TEXTURE_2D),w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,z.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,z.unpackAlignment);const ct=w.getParameter(w.UNPACK_ROW_LENGTH),Pn=w.getParameter(w.UNPACK_IMAGE_HEIGHT),cs=w.getParameter(w.UNPACK_SKIP_PIXELS),pn=w.getParameter(w.UNPACK_SKIP_ROWS),or=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,Pt.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Pt.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,We),w.pixelStorei(w.UNPACK_SKIP_ROWS,Ve),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Be);const Tt=b.isDataArrayTexture||b.isData3DTexture,yn=z.isDataArrayTexture||z.isData3DTexture;if(b.isDepthTexture){const Mn=re.get(b),en=re.get(z),cn=re.get(Mn.__renderTarget),ma=re.get(en.__renderTarget);J.bindFramebuffer(w.READ_FRAMEBUFFER,cn.__webglFramebuffer),J.bindFramebuffer(w.DRAW_FRAMEBUFFER,ma.__webglFramebuffer);for(let Ni=0;Ni<Re;Ni++)Tt&&(w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,re.get(b).__webglTexture,k,Be+Ni),w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,re.get(z).__webglTexture,he,Dt+Ni)),w.blitFramebuffer(We,Ve,_e,Ce,it,at,_e,Ce,w.DEPTH_BUFFER_BIT,w.NEAREST);J.bindFramebuffer(w.READ_FRAMEBUFFER,null),J.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(k!==0||b.isRenderTargetTexture||re.has(b)){const Mn=re.get(b),en=re.get(z);J.bindFramebuffer(w.READ_FRAMEBUFFER,tp),J.bindFramebuffer(w.DRAW_FRAMEBUFFER,np);for(let cn=0;cn<Re;cn++)Tt?w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,Mn.__webglTexture,k,Be+cn):w.framebufferTexture2D(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Mn.__webglTexture,k),yn?w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,en.__webglTexture,he,Dt+cn):w.framebufferTexture2D(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,en.__webglTexture,he),k!==0?w.blitFramebuffer(We,Ve,_e,Ce,it,at,_e,Ce,w.COLOR_BUFFER_BIT,w.NEAREST):yn?w.copyTexSubImage3D(Wt,he,it,at,Dt+cn,We,Ve,_e,Ce):w.copyTexSubImage2D(Wt,he,it,at,We,Ve,_e,Ce);J.bindFramebuffer(w.READ_FRAMEBUFFER,null),J.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else yn?b.isDataTexture||b.isData3DTexture?w.texSubImage3D(Wt,he,it,at,Dt,_e,Ce,Re,rt,ke,Pt.data):z.isCompressedArrayTexture?w.compressedTexSubImage3D(Wt,he,it,at,Dt,_e,Ce,Re,rt,Pt.data):w.texSubImage3D(Wt,he,it,at,Dt,_e,Ce,Re,rt,ke,Pt):b.isDataTexture?w.texSubImage2D(w.TEXTURE_2D,he,it,at,_e,Ce,rt,ke,Pt.data):b.isCompressedTexture?w.compressedTexSubImage2D(w.TEXTURE_2D,he,it,at,Pt.width,Pt.height,rt,Pt.data):w.texSubImage2D(w.TEXTURE_2D,he,it,at,_e,Ce,rt,ke,Pt);w.pixelStorei(w.UNPACK_ROW_LENGTH,ct),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Pn),w.pixelStorei(w.UNPACK_SKIP_PIXELS,cs),w.pixelStorei(w.UNPACK_SKIP_ROWS,pn),w.pixelStorei(w.UNPACK_SKIP_IMAGES,or),he===0&&z.generateMipmaps&&w.generateMipmap(Wt),J.unbindTexture()},this.copyTextureToTexture3D=function(b,z,X=null,$=null,k=0){return Lo('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,z,X,$,k)},this.initRenderTarget=function(b){re.get(b).__webglFramebuffer===void 0&&C.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?C.setTextureCube(b,0):b.isData3DTexture?C.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?C.setTexture2DArray(b,0):C.setTexture2D(b,0),J.unbindTexture()},this.resetState=function(){R=0,A=0,I=null,J.reset(),xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ot._getDrawingBufferColorSpace(e),t.unpackColorSpace=ot._getUnpackColorSpace()}}const ly={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class ua{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const hy=new Fl(-1,1,1,-1,0,1);class uy extends At{constructor(){super(),this.setAttribute("position",new et([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new et([0,2,0,0,2,0],2))}}const fy=new uy;class dy{constructor(e){this._mesh=new H(fy,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,hy)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Rf extends ua{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof jn?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=af.clone(e.uniforms),this.material=new jn({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new dy(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class vu extends ua{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class py extends ua{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class my{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new ee);this._width=n.width,this._height=n.height,t=new Pi(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Qs}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Rf(ly),this.copyPass.material.blending=fi,this.clock=new b0}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}vu!==void 0&&(o instanceof vu?n=!0:o instanceof py&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new ee);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class gy extends ua{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ae}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}}const bn={rifle:{name:"ASSAULT RIFLE",mag:30,damage:25,fireRate:100,reloadTime:1500,spread:.01,pellets:1,recoil:.003,color:3355443},shotgun:{name:"SHOTGUN",mag:8,damage:15,fireRate:600,reloadTime:2e3,spread:.08,pellets:6,recoil:.01,color:6702114},pistol:{name:"PISTOL",mag:12,damage:18,fireRate:200,reloadTime:1e3,spread:.015,pellets:1,recoil:.005,color:2241348},sniper:{name:"SNIPER RIFLE",mag:5,damage:150,fireRate:1200,reloadTime:2500,spread:.002,pellets:1,recoil:.015,color:2763306},lmg:{name:"LIGHT MG",mag:100,damage:18,fireRate:70,reloadTime:3500,spread:.025,pellets:1,recoil:.004,color:4473907},flamethrower:{name:"FLAMETHROWER",mag:250,damage:6,fireRate:50,reloadTime:4e3,spread:.25,pellets:1,recoil:.001,color:16729088},chainsaw:{name:"CHAINSAW",mag:999,damage:35,fireRate:80,reloadTime:100,spread:.1,pellets:1,recoil:.002,color:11145489},wand_fire:{name:"WAND OF FIRE",mag:50,damage:1e3,fireRate:800,reloadTime:1e3,spread:0,pellets:1,recoil:.005,color:16729088,isWand:!0},wand_ice:{name:"WAND OF ICE",mag:50,damage:10,fireRate:100,reloadTime:1e3,spread:0,pellets:1,recoil:.001,color:65535,isWand:!0},wand_lightning:{name:"WAND OF LIGHTNING",mag:50,damage:150,fireRate:400,reloadTime:1e3,spread:0,pellets:1,recoil:.008,color:16777130,isWand:!0},wand_earth:{name:"WAND OF EARTH",mag:50,damage:50,fireRate:1e3,reloadTime:1e3,spread:0,pellets:1,recoil:.02,color:8956484,isWand:!0}},_={health:100,maxHealth:100,weapon:"rifle",ammo:bn.rifle.mag,maxAmmo:bn.rifle.mag,reloading:!1,reloadTime:bn.rifle.reloadTime,reloadStart:0,score:0,kills:0,wave:1,alive:!0,started:!1,paused:!1,speed:8,sprintMult:1.6,jumping:!1,velY:0,gravity:25,playerHeight:1.7,shootCooldown:0,shootRate:bn.rifle.fireRate,enemies:[],particles:[],projectiles:[],grenades:[],pickups:[],keys:{},mouse:{x:0,y:0},waveActive:!1,damageFlashTime:0,targetFov:75,grenadeCount:3,maxGrenades:3,empCount:1,combo:0,comboTimer:0,aiming:!1,lastKillTime:0,sprint:100,maxSprint:100,isSprinting:!1,corpses:[],bloodDecals:[],captureZones:[],screenShake:0,shakeIntensity:0,damageNumbers:[],crouching:!1,regenCooldown:0,headshots:0,bestCombo:0,raccoons:[],physicsBarrels:[],networkMode:!1,pendingRespawn:null};let Me=null;function Pf(){Me||(Me=new(window.AudioContext||window.webkitAudioContext))}function Et(i){if(!Me)return;if(Me.state==="suspended"){Me.resume().catch(()=>{});return}const e=Me.currentTime;if(i==="shoot"){const t=Me.createBufferSource(),n=Me.createBuffer(1,Me.sampleRate*.15,Me.sampleRate),s=n.getChannelData(0);for(let u=0;u<s.length;u++){const f=u/Me.sampleRate;s[u]=(Math.random()*2-1)*Math.exp(-f*30)*.6}t.buffer=n;const r=Me.createBiquadFilter();r.type="lowpass",r.frequency.value=3e3,r.frequency.setValueAtTime(3e3,e),r.frequency.exponentialRampToValueAtTime(300,e+.12);const o=Me.createGain();t.connect(r),r.connect(o),o.connect(Me.destination),o.gain.setValueAtTime(.35,e),o.gain.exponentialRampToValueAtTime(.01,e+.12),t.start(e);const a=Me.createOscillator(),c=Me.createGain();a.connect(c),c.connect(Me.destination),a.frequency.setValueAtTime(150,e),a.frequency.exponentialRampToValueAtTime(40,e+.08),c.gain.setValueAtTime(.25,e),c.gain.exponentialRampToValueAtTime(.01,e+.08),a.start(e),a.stop(e+.08);const l=Me.createOscillator(),h=Me.createGain();l.connect(h),h.connect(Me.destination),l.type="square",l.frequency.setValueAtTime(2e3,e),l.frequency.exponentialRampToValueAtTime(200,e+.02),h.gain.setValueAtTime(.15,e),h.gain.exponentialRampToValueAtTime(.01,e+.02),l.start(e),l.stop(e+.03)}else if(i==="reload")for(let t=0;t<3;t++){const n=Me.createOscillator(),s=Me.createGain();n.connect(s),s.connect(Me.destination),n.frequency.value=200+t*50;const r=e+t*.15;s.gain.setValueAtTime(.1,r),s.gain.exponentialRampToValueAtTime(.01,r+.1),n.start(r),n.stop(r+.1)}else if(i==="hit"){const t=Me.createOscillator(),n=Me.createGain();t.connect(n),n.connect(Me.destination),t.frequency.setValueAtTime(400,e),t.frequency.exponentialRampToValueAtTime(100,e+.05),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.01,e+.05),t.start(e),t.stop(e+.05)}else if(i==="headshot"){const t=Me.createOscillator(),n=Me.createGain();t.connect(n),n.connect(Me.destination),t.type="triangle",t.frequency.setValueAtTime(3e3,e),t.frequency.exponentialRampToValueAtTime(800,e+.1),n.gain.setValueAtTime(.3,e),n.gain.exponentialRampToValueAtTime(.01,e+.1),t.start(e),t.stop(e+.1)}else if(i==="death")for(let t=0;t<3;t++){const n=Me.createOscillator(),s=Me.createGain();n.connect(s),s.connect(Me.destination),n.frequency.value=200-t*40;const r=e+t*.2;s.gain.setValueAtTime(.15,r),s.gain.exponentialRampToValueAtTime(.01,r+.2),n.start(r),n.stop(r+.2)}else if(i==="explosion"){[40,80,200].forEach((t,n)=>{const s=Me.createOscillator(),r=Me.createGain();s.connect(r),r.connect(Me.destination),s.type=n===2?"square":"sine",s.frequency.setValueAtTime(t,Me.currentTime),s.frequency.exponentialRampToValueAtTime(t*.3,Me.currentTime+.4),r.gain.setValueAtTime(n===2?.15:.25,Me.currentTime),r.gain.exponentialRampToValueAtTime(.001,Me.currentTime+.4+n*.1),s.start(Me.currentTime),s.stop(Me.currentTime+.5+n*.1)});return}else if(i==="pickup")[500,700,900].forEach((t,n)=>{const s=Me.createOscillator(),r=Me.createGain();s.connect(r),r.connect(Me.destination),s.frequency.value=t;const o=e+n*.06;r.gain.setValueAtTime(.1,o),r.gain.exponentialRampToValueAtTime(.01,o+.08),s.start(o),s.stop(o+.08)});else if(i==="footstep"){const t=Me.createOscillator(),n=Me.createGain();t.connect(n),n.connect(Me.destination),t.frequency.setValueAtTime(80,Me.currentTime),t.frequency.exponentialRampToValueAtTime(40,Me.currentTime+.08),n.gain.setValueAtTime(.18,Me.currentTime),n.gain.exponentialRampToValueAtTime(.001,Me.currentTime+.1),t.start(Me.currentTime),t.stop(Me.currentTime+.1);return}else if(i==="drone_buzz"){const t=Me.createOscillator(),n=Me.createGain(),s=Me.createWaveShaper(),r=new Float32Array(256);for(let o=0;o<256;o++){const a=o*2/256-1;r[o]=(Math.PI+300)*a/(Math.PI+300*Math.abs(a))}s.curve=r,t.connect(s),s.connect(n),n.connect(Me.destination),t.type="sawtooth",t.frequency.setValueAtTime(120+Math.random()*20,Me.currentTime),t.frequency.linearRampToValueAtTime(110,Me.currentTime+.3),n.gain.setValueAtTime(.05,Me.currentTime),n.gain.exponentialRampToValueAtTime(.001,Me.currentTime+.3),t.start(Me.currentTime),t.stop(Me.currentTime+.3);return}}function _y(){if(!Me)return;const i=Me.createBuffer(1,Me.sampleRate*2,Me.sampleRate),e=i.getChannelData(0);for(let r=0;r<e.length;r++)e[r]=(Math.random()*2-1)*.015;const t=Me.createBufferSource();t.buffer=i,t.loop=!0;const n=Me.createBiquadFilter();n.type="lowpass",n.frequency.value=400;const s=Me.createGain();s.gain.value=.08,t.connect(n),n.connect(s),s.connect(Me.destination),t.start()}const Df={synth:window.speechSynthesis,voice:null,lastSpoke:0,minInterval:3e3,init(){const i=()=>{const e=this.synth.getVoices();this.voice=e.find(t=>t.lang.startsWith("en-GB")&&t.name.toLowerCase().includes("female"))||e.find(t=>t.lang.startsWith("en-GB")&&(t.name.includes("Hazel")||t.name.includes("Sonia")||t.name.includes("Amy")))||e.find(t=>t.lang.startsWith("en-GB"))||e.find(t=>t.lang.startsWith("en")&&t.name.toLowerCase().includes("female"))||e.find(t=>t.lang.startsWith("en"))||e[0],this.voice&&console.log("[LIRIL Voice]",this.voice.name,this.voice.lang)};i(),this.synth.onvoiceschanged!==void 0&&(this.synth.onvoiceschanged=i)},speak(i,e=!1){const t=Date.now();if(!e&&t-this.lastSpoke<this.minInterval||!this.voice)return;this.synth.cancel();const n=new SpeechSynthesisUtterance(i);n.voice=this.voice,n.rate=1.1,n.pitch=1.05,n.volume=.8,this.synth.speak(n),this.lastSpoke=t}},vy={waveStart:["Contacts ahead. Stay sharp.","Hostiles inbound. Weapons free.","New wave. Keep your head down.","Movement detected. Engage at will.","Here they come. Give them nothing."],bossWave:["Heavy armour incoming. Use explosives.","Boss wave. This is going to be loud.","Armoured targets. Aim for the head."],kill:["Target down.","Hostile eliminated.","Good kill.","Scratch one."],headshot:["Headshot. Clean.","Right between the eyes.","Perfect shot.","That one felt personal."],multiKill:["Multiple contacts down. Impressive.","Double kill. Keep it up.","You are on fire."],lowHealth:["You are hit. Find cover.","Taking damage. Get behind something.","Medic. You need to heal."],reload:["Reloading. Cover me.","Mag change.","Going dry. Reloading."],airstrike:["Avro Arrow inbound. Danger close.","Airstrike confirmed. Get clear.","Arrow on station. Bombs away."],grenade:["Quack quack. Duck out.","Rubber duck deployed.","Duck grenade. Fire in the hole."],pickup:["Supplies acquired.","Health pack. Good.","Ammo resupply."],death:["Soldier down. We will remember you.","K I A. Rest now."],highCombo:["Killstreak. You are unstoppable.","Combo multiplier active. Keep pushing."]};function Wn(i){const e=vy[i];!e||!e.length||Df.speak(e[Math.floor(Math.random()*e.length)],i==="death"||i==="bossWave")}const Zt=48,Jt=48;function xy(){const i=[];for(let r=0;r<Jt;r++){i[r]=[];for(let o=0;o<Zt;o++)o===0||o===Zt-1||r===0||r===Jt-1?i[r][o]=1:i[r][o]=0}const e=[{x:3,y:3,w:5,h:4},{x:10,y:2,w:4,h:3},{x:16,y:3,w:6,h:5},{x:3,y:9,w:4,h:5},{x:9,y:10,w:3,h:3},{x:14,y:10,w:5,h:4},{x:3,y:16,w:5,h:4},{x:10,y:16,w:4,h:3},{x:16,y:15,w:3,h:5}],t=[{x:26,y:2,w:8,h:5},{x:36,y:2,w:6,h:4},{x:26,y:9,w:6,h:6},{x:34,y:8,w:8,h:4},{x:26,y:17,w:5,h:4},{x:33,y:15,w:7,h:6},{x:42,y:8,w:4,h:6}],n=[{x:3,y:26,w:4,h:3},{x:9,y:26,w:4,h:3},{x:15,y:26,w:4,h:3},{x:3,y:31,w:4,h:3},{x:9,y:31,w:4,h:3},{x:15,y:31,w:4,h:3},{x:3,y:36,w:4,h:3},{x:9,y:36,w:4,h:3},{x:15,y:36,w:4,h:3},{x:3,y:41,w:5,h:4},{x:10,y:41,w:6,h:4}],s=[{x:28,y:28,w:10,h:3},{x:28,y:33,w:5,h:5},{x:35,y:33,w:5,h:5},{x:28,y:40,w:12,h:4},{x:42,y:28,w:4,h:6},{x:42,y:36,w:4,h:8}];return[...e,...t,...n,...s].forEach(r=>{for(let o=r.y;o<r.y+r.h&&o<Jt-1;o++)for(let a=r.x;a<r.x+r.w&&a<Zt-1;a++)o===r.y&&a===r.x+Math.floor(r.w/2)||o===r.y+r.h-1&&a===r.x+Math.floor(r.w/2)||r.w>=6&&a===r.x+r.w-1&&o===r.y+Math.floor(r.h/2)||(i[o][a]=1)}),[[6,7],[12,7],[18,8],[30,6],[38,6],[44,12],[6,20],[12,20],[24,24],[36,24],[44,24],[6,30],[18,30],[24,30],[36,30],[6,40],[18,40],[30,38],[42,44]].forEach(([r,o])=>{i[o]&&i[o][r]===0&&(i[o][r]=2)}),[[8,5],[14,4],[22,6],[32,5],[40,4],[44,10],[8,14],[20,13],[22,18],[32,20],[40,18],[5,24],[14,24],[22,28],[34,26],[40,28],[5,34],[14,34],[22,34],[34,38],[40,38],[8,44],[20,44],[34,44]].forEach(([r,o])=>{i[o]&&i[o][r]===0&&(i[o][r]=3)}),[[10,6],[23,5],[35,7],[43,15],[7,18],[17,18],[25,22],[37,22],[5,30],[16,30],[25,35],[37,35],[10,44],[22,40],[35,42],[44,40]].forEach(([r,o])=>{i[o]&&i[o][r]===0&&(i[o][r]=4)}),[[4,6],[15,6],[21,10],[33,10],[41,6],[4,15],[21,15],[33,15],[44,18],[4,28],[15,28],[21,28],[33,28],[44,32],[4,38],[15,38],[21,38],[33,38],[44,38]].forEach(([r,o])=>{i[o]&&i[o][r]===0&&(i[o][r]=5)}),i}const Qi=xy();function Xt(i,e,t=.4){const n=[[i-t,e-t],[i+t,e-t],[i-t,e+t],[i+t,e+t]];for(const[s,r]of n){const o=Math.floor(s),a=Math.floor(r);if(o<0||o>=Zt||a<0||a>=Jt||Qi[a][o]>=1)return!0}return!1}function Bl(i,e){if(Qi[e]&&Qi[e][i]===0)return[i+.5,e+.5];for(let t=1;t<8;t++)for(let n=-t;n<=t;n++)for(let s=-t;s<=t;s++){const r=i+s,o=e+n;if(r>0&&r<Zt-1&&o>0&&o<Jt-1&&Qi[o][r]===0)return[r+.5,o+.5]}return[i+.5,e+.5]}function ai(i,e,t){const n=document.createElement("canvas");n.width=i,n.height=e;const s=n.getContext("2d");t(s,i,e);const r=new ns(n);return r.wrapS=r.wrapT=mi,r.magFilter=wn,r}function yy(i){const e=ai(256,256,(U,F,W)=>{U.fillStyle="#3a2a1a",U.fillRect(0,0,F,W);for(let N=0;N<16;N++)for(let oe=0;oe<8;oe++){const fe=N%2?16:0,ve=80+Math.random()*40,De=45+Math.random()*25,$e=25+Math.random()*15;U.fillStyle=`rgb(${ve},${De},${$e})`,U.fillRect(oe*32+fe+1,N*16+1,30,14);for(let Y=0;Y<15;Y++){const ce=Math.random()*20-10;U.fillStyle=`rgba(${ce>0?255:0},${ce>0?255:0},${ce>0?255:0},${Math.abs(ce)/100})`,U.fillRect(oe*32+fe+1+Math.random()*28,N*16+1+Math.random()*12,3,2)}}for(let N=0;N<4;N++){const oe=Math.random()*F;U.fillStyle="rgba(10,8,5,0.3)",U.fillRect(oe,0,3+Math.random()*5,W*(.3+Math.random()*.7))}}),t=ai(64,128,(U,F,W)=>{U.fillStyle="#445566",U.fillRect(0,0,F,W);for(let N=0;N<8;N++)U.fillStyle=N%2?"#4a5d6e":"#3d5060",U.fillRect(0,N*16,F,16);U.strokeStyle="#556677",U.lineWidth=2,U.strokeRect(2,2,F-4,W-4)}),n=ai(64,64,(U,F,W)=>{U.fillStyle="#8B7355",U.fillRect(0,0,F,W),U.strokeStyle="#6B5335",U.lineWidth=3,U.strokeRect(4,4,F-8,W-8),U.beginPath(),U.moveTo(4,4),U.lineTo(F-4,W-4),U.moveTo(F-4,4),U.lineTo(4,W-4),U.stroke()}),s=ai(64,96,(U,F,W)=>{U.fillStyle="#aa2222",U.fillRect(0,0,F,W),U.fillStyle="#cc3333";for(let N=0;N<3;N++)U.fillRect(0,N*32+2,F,28);U.strokeStyle="#881111",U.lineWidth=2;for(let N=0;N<=3;N++)U.beginPath(),U.moveTo(0,N*32),U.lineTo(F,N*32),U.stroke();U.fillStyle="#000",U.font="bold 20px monospace",U.fillText("!",F/2-5,W/2+7)}),r=ai(64,64,(U,F,W)=>{U.fillStyle="#9a8866",U.fillRect(0,0,F,W),U.fillStyle="#aa9977";for(let N=0;N<4;N++)U.fillRect(2,N*16+2,F-4,12);U.strokeStyle="#776644",U.lineWidth=1;for(let N=0;N<=4;N++)U.beginPath(),U.moveTo(0,N*16),U.lineTo(F,N*16),U.stroke()}),o=ai(256,256,(U,F,W)=>{U.fillStyle="#3a3a38",U.fillRect(0,0,F,W);for(let N=0;N<W;N+=2)for(let oe=0;oe<F;oe+=2){const fe=50+Math.random()*20;U.fillStyle=`rgb(${fe},${fe},${fe-2})`,U.fillRect(oe,N,2,2)}U.strokeStyle="#222",U.lineWidth=2;for(let N=0;N<=4;N++)U.beginPath(),U.moveTo(N*64,0),U.lineTo(N*64,W),U.stroke(),U.beginPath(),U.moveTo(0,N*64),U.lineTo(F,N*64),U.stroke()});o.repeat.set(Zt,Jt);const a=new Kt(Zt,Jt),c=new ue({map:o,roughness:.9,metalness:.1}),l=new H(a,c);l.rotation.x=-Math.PI/2,l.position.set(Zt/2,0,Jt/2),l.receiveShadow=!0,i.add(l);const h=new ue({map:e,roughness:.8,metalness:.2}),u=new ue({map:t,roughness:.7,metalness:.3}),f=new ue({map:n,roughness:.9,metalness:.1}),d=new ue({map:s,roughness:.6,metalness:.2}),g=new ue({map:r,roughness:.85,metalness:.05}),v=new vt;i.add(v);for(let U=0;U<Jt;U++)for(let F=0;F<Zt;F++){const W=Qi[U][F];if(W===1){const N=new H(new Fe(1,3,1),h);N.position.set(F+.5,1.5,U+.5),N.castShadow=!0,N.receiveShadow=!0,v.add(N)}else if(W===2){const N=new H(new Xe(.3,.3,3,8),u);N.position.set(F+.5,1.5,U+.5),N.castShadow=!0,N.receiveShadow=!0,v.add(N)}else if(W===3){const N=new H(new Fe(.8,.8,.8),f);N.position.set(F+.5,.4,U+.5),N.rotation.y=Math.random()*Math.PI*2,N.castShadow=!0,N.receiveShadow=!0,v.add(N)}else if(W===4){const N=new H(new Xe(.35,.35,.9,12),d);N.position.set(F+.5,.45,U+.5),N.castShadow=!0,N.receiveShadow=!0,N.userData={explosive:!0,x:F+.5,z:U+.5},v.add(N)}else if(W===5){const N=new H(new Fe(.9,.5,.9),g);N.position.set(F+.5,.25,U+.5),N.castShadow=!0,N.receiveShadow=!0,v.add(N)}}const m=[];v.children.forEach(U=>{if(U.userData.explosive){const F=new An(16746547,.5,4);F.position.set(U.position.x,1.2,U.position.z),i.add(F),m.push(F)}}),new nt({color:16711680,side:Mt}),new nt({color:16720384,side:Mt});const p=new nt({color:16777215,side:Mt}),E=new vt,y=new H(new Kt(1.5,.6),new nt({color:13369344,side:Mt}));y.position.set(0,0,0),E.add(y);const x=new H(new Kt(1.2,.4),p);x.position.set(0,0,.01),E.add(x);const D=new H(new Xe(.04,.04,2.5,6),new ue({color:8947848}));D.position.set(0,-1.5,0),E.add(D),E.position.set(8.5,3.2,3.5),i.add(E),[[5,5],[22,12],[12,22],[35,18],[18,35]].forEach(([U,F])=>{if(Xt(U,F,.5))return;const W=new H(new Xe(.04,.04,5,6),new ue({color:8947848,metalness:.7}));W.position.set(U,2.5,F),i.add(W);const N=new H(new Kt(1.2,.7),new nt({color:13369344,side:Mt}));N.position.set(U+.7,4.8,F),i.add(N);const oe=new H(new Kt(.4,.7),new nt({color:16777215,side:Mt}));oe.position.set(U+.7,4.8,F+.001),i.add(oe)});const R=new vt,A=new ue({color:2759178,roughness:.8}),I=new H(new Fe(5,1.5,.15),A);I.position.set(0,0,0),R.add(I);const T=new nt({color:12852794}),M=new H(new Fe(5.2,1.7,.1),T);M.position.set(0,0,-.04),R.add(M),[-2,2].forEach(U=>{const F=new H(new Xe(.06,.06,3,8),new ue({color:8947848,metalness:.7}));F.position.set(U,-2,0),R.add(F)});const L=new nt({color:16720384,side:Mt}),V=new H(new Di(.3,5),L);V.position.set(0,0,.08),R.add(V),R.position.set(24,2.5,20),i.add(R);const G=new An(16746564,1.5,8);G.position.set(24,4,20),i.add(G);const j=new ue({color:16777215,roughness:1,opacity:.7,transparent:!0});return[[14,8],[24,14],[6,24],[38,32],[16,40],[30,44]].forEach(([U,F])=>{const W=new H(new Kt(4+Math.random()*3,3+Math.random()*2),j);W.rotation.x=-Math.PI/2,W.position.set(U,.01,F),i.add(W)}),{mapGroup:v,barrelLights:m,kickBarrels}}function My(i,e){const[t,n]=Bl(24,24),s=new vt,r=new H(new Xe(.06,.08,10,8),new ue({color:8947848,metalness:.85,roughness:.25}));r.position.y=5,s.add(r);const o=new nt({color:13369344,side:Mt}),a=new H(new Kt(2.5,1.4),o);a.position.set(1.25,9.3,0),s.add(a);const c=new nt({color:16777215,side:Mt}),l=new H(new Di(.3,12),c);l.position.set(1.25,9.3,.01),s.add(l);const h=new H(new Fe(3,1,3),new ue({color:2763290,roughness:.9}));h.position.y=.5,s.add(h);for(let m=0;m<8;m++){const p=m/8*Math.PI*2,E=new H(new Fe(.7,.45,.35),new ue({color:8022586,roughness:.95}));E.position.set(Math.sin(p)*2,.22,Math.cos(p)*2),E.rotation.y=p,s.add(E)}const u=new nt({color:16711680}),f=new H(new Kt(.5,.3),u);f.position.set(0,1.22,.55),f.rotation.x=-.2,s.add(f);const d=new An(16711680,3,22);d.position.set(0,10.5,0),s.add(d);const g=new nt({color:16711680}),v=new H(new mt(.25),g);v.position.set(0,10.5,0),s.add(v),s.position.set(t,0,n),i.add(s),Qi[Math.floor(n)][Math.floor(t)]=3,e.captureZones.push({name:"COMMAND",x:t,z:n,group:s,screen:u,beacon:d,beaconMesh:g,captured:!1,progress:0,mesh:{material:{opacity:.3}}})}function Sy(i){const e=[],t=new ue({color:16777215,roughness:.5}),n=new ue({color:16720418,emissive:16711680,emissiveIntensity:.6}),s={x:24,z:28};if(!Xt(s.x,s.z,.5)){const r=new vt,o=new H(new Fe(.65,.65,.65),t);r.add(o);const a=new H(new Fe(.45,.13,.13),n);a.position.z=.34,r.add(a);const c=new H(new Fe(.13,.45,.13),n);c.position.z=.34,r.add(c),r.position.set(s.x,.33,s.z),i.add(r);const l=new An(16720418,1.8,5);l.position.set(s.x,1.4,s.z),i.add(l),e.push({mesh:r,light:l,box:o,x:s.x,z:s.z,cooldown:0})}return e}const Ey="modulepreload",Ty=function(i){return"/reduster/"+i},xu={},ir=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(l){return Promise.all(l.map(h=>Promise.resolve(h).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");s=o(t.map(l=>{if(l=Ty(l),l in xu)return;xu[l]=!0;const h=l.endsWith(".css"),u=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const f=document.createElement("link");if(f.rel=h?"stylesheet":Ey,h||(f.as="script"),f.crossOrigin="",f.href=l,c&&f.setAttribute("nonce",c),document.head.appendChild(f),h)return new Promise((d,g)=>{f.addEventListener("load",d),f.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&r(a.reason);return e().catch(r)})};function Zn(){const i=document.getElementById("healthVal"),e=document.getElementById("ammoVal"),t=document.getElementById("ammoMax"),n=document.getElementById("scoreVal"),s=document.getElementById("waveVal"),r=document.getElementById("enemyCount"),o=document.getElementById("grenadeCount"),a=document.getElementById("healthFill"),c=document.getElementById("sprintFill");i&&(i.textContent=Math.ceil(_.health)),e&&(e.textContent=_.ammo),t&&(t.textContent=_.maxAmmo),n&&(n.textContent=_.score),s&&(s.textContent=_.wave),r&&(r.textContent=_.enemies.length),o&&(o.textContent=_.grenadeCount);const l=document.getElementById("empCount");if(l&&(l.textContent="⚡"+(_.empCount||0)),a){const d=_.health/_.maxHealth*100;a.style.width=d+"%",a.style.background=d>50?"#33ff33":d>25?"#ffcc00":"#ff3333"}c&&(c.style.width=_.sprint/_.maxSprint*100+"%");const h=document.getElementById("droneRadar"),u=document.getElementById("droneCount");if(h&&u){const d=_.enemies.filter(g=>g.type==="drone"&&!g.dead);d.length>0?(h.style.display="flex",u.textContent=d.length+" DRONE"+(d.length>1?"S":"")):h.style.display="none"}const f=document.getElementById("objectivesHud");if(f&&_.captureZones.length){const d=_.captureZones.filter(m=>m.captured).length,g=d>0?` [+${d*50}% SCORE]`:"",v=_.captureZones.map(m=>`${m.name}[${m.captured?"✓":"_"}]`).join(" ");f.textContent="OBJ: "+v+g,f.style.color=d>0?"#33ff99":"#ffcc00"}}function by(i){const e=document.getElementById("hitMarker");e&&(e.style.display="block",e.style.color=i?"#ffff00":"#ff3333",e.textContent=i?"☠":"✕",setTimeout(()=>{e.style.display="none"},150))}function wy(){const i=document.getElementById("dmgFlash");i&&(i.style.opacity="0.6",setTimeout(()=>{i.style.opacity="0"},150))}function st(i,e){const t=document.getElementById("killFeed");if(!t)return;const n=document.createElement("div");n.className="killFeedEntry",n.textContent=i;let s="#ff3333";for(/^🛸|^⚡/.test(i)?s="#ff8800":/^✅|^❤️|^🏥/.test(i)?s="#33ff99":/^📦|^🔫/.test(i)?s="#ffcc00":/^⏱|^💙/.test(i)?s="#44aaff":/^☭/.test(i)?s="#ff2222":/^⚠/.test(i)&&(s="#ff6600"),n.style.borderLeftColor=s,t.insertBefore(n,t.firstChild),setTimeout(()=>{n.style.transition="opacity 0.4s, transform 0.4s",n.style.opacity="0",n.style.transform="translateX(30px)",setTimeout(()=>n.remove(),420)},3500);t.children.length>8;)t.removeChild(t.lastChild)}function Cy(i){const e=document.getElementById("weaponName");e&&(e.textContent=i,e.style.display="block",e.style.opacity="1",setTimeout(()=>{e.style.opacity="0"},1500),setTimeout(()=>{e.style.display="none"},1800))}function If(){const i=document.getElementById("lowHealthPulse");if(!i)return;const e=_.health/_.maxHealth;i.style.opacity=e<.3?(.3-e)/.3*.7:"0"}function Ay(i){const e=document.getElementById("comboText");e&&i>=3&&(e.textContent=`${i}x COMBO!`,e.style.display="block",e.style.opacity="1",clearTimeout(e._timeout),e._timeout=setTimeout(()=>{e.style.display="none"},1200))}const Ry=120;let Ft=.25;const si=[{t:0,sky:new Ae(1296),fog:new Ae(1296),ambient:.05,sunCol:new Ae(1056816)},{t:.22,sky:new Ae(657440),fog:new Ae(657440),ambient:.1,sunCol:new Ae(1708096)},{t:.28,sky:new Ae(4856330),fog:new Ae(3805704),ambient:.35,sunCol:new Ae(16737843)},{t:.35,sky:new Ae(6724044),fog:new Ae(4482696),ambient:.7,sunCol:new Ae(16772795)},{t:.5,sky:new Ae(8040140),fog:new Ae(4491434),ambient:1,sunCol:new Ae(16777215)},{t:.65,sky:new Ae(6724044),fog:new Ae(4482696),ambient:.7,sunCol:new Ae(16772795)},{t:.75,sky:new Ae(7023114),fog:new Ae(5906952),ambient:.3,sunCol:new Ae(16729122)},{t:.82,sky:new Ae(657440),fog:new Ae(657432),ambient:.1,sunCol:new Ae(1708096)},{t:1,sky:new Ae(1296),fog:new Ae(1296),ambient:.05,sunCol:new Ae(1056816)}];function Py(i){i=(i%1+1)%1;let e=si[si.length-2],t=si[si.length-1];for(let s=0;s<si.length-1;s++)if(i>=si[s].t&&i<si[s+1].t){e=si[s],t=si[s+1];break}const n=(i-e.t)/(t.t-e.t+1e-4);return{sky:e.sky.clone().lerp(t.sky,n),fog:e.fog.clone().lerp(t.fog,n),ambient:e.ambient+(t.ambient-e.ambient)*n,sunCol:e.sunCol.clone().lerp(t.sunCol,n)}}const Dy=()=>Ft<.22||Ft>.78;function Iy(i,e,t,n,s,r,o,a,c){if(!_.started)return;Ft=(Ft+i/Ry)%1;const{sky:l,fog:h,ambient:u,sunCol:f}=Py(Ft);e.background=l,e.fog.color.copy(h),n.intensity=u,s.color.copy(f),s.intensity=.4+u*1.2;const d=Ft*Math.PI*2,g=a/2,v=c/2,m=45,p=30;r.position.set(g+Math.cos(d)*m,p*Math.sin(d),v+Math.sin(d)*5),o.position.set(g-Math.cos(d)*m,p*Math.sin(d+Math.PI),v-Math.sin(d)*5),s.position.copy(r.position),r.visible=Ft>.2&&Ft<.8,o.visible=Ft<.2||Ft>.8,t&&(t.material.opacity=Ft<.25||Ft>.75?.8:Math.max(0,1-Math.abs(Ft-.5)*8));const E=Math.floor(Ft*24),y=Math.floor((Ft*24-E)*60),x=Ft<.22||Ft>.78?"🌙 NIGHT":Ft<.28?"🌅 DAWN":Ft<.72?"☀ DAY":"🌇 DUSK",D=document.getElementById("timeOfDay");D&&(D.textContent=`${x}  ${String(E).padStart(2,"0")}:${String(y).padStart(2,"0")}`)}function vn(i,e,t,n,s,r){const o=new mt(.03+Math.random()*.03,4,4),a=new nt({color:s||16711680}),c=new H(o,a);c.position.set(e,t,n),i.add(c);const l=r||{x:(Math.random()-.5)*4,y:1+Math.random()*3,z:(Math.random()-.5)*4};_.particles.push({mesh:c,x:e,y:t,z:n,vx:l.x||l.x,vy:l.y||l.y,vz:l.z||l.z,life:.5+Math.random()*.5,isGib:!1})}function Lf(i,e,t){const n=.2+Math.random()*.4,s=new Di(n,8),r=new ue({color:6684672,transparent:!0,opacity:.7,depthWrite:!1,roughness:1}),o=new H(s,r);for(o.rotation.x=-Math.PI/2,o.position.set(e,.01,t),i.add(o),_.bloodDecals.push(o);_.bloodDecals.length>50;){const a=_.bloodDecals.shift();i.remove(a)}}function Ly(i,e){for(let t=_.particles.length-1;t>=0;t--){const n=_.particles[t];if(n.mesh){if(n.isGib&&n.mesh.userData&&n.mesh.userData.vel){n.mesh.position.addScaledVector(n.mesh.userData.vel,e),n.mesh.userData.vel.y-=30*e,n.mesh.userData.spin&&(n.mesh.rotation.x+=n.mesh.userData.spin.x*e,n.mesh.rotation.y+=n.mesh.userData.spin.y*e,n.mesh.rotation.z+=n.mesh.userData.spin.z*e),n.mesh.position.y<.5&&(n.mesh.position.y=.5,n.mesh.userData.vel.y=Math.abs(n.mesh.userData.vel.y)*.25,n.mesh.userData.vel.x*=.5,n.mesh.userData.vel.z*=.5),n.life-=e,n.life<=0&&(i.remove(n.mesh),_.particles.splice(t,1));continue}n.x+=n.vx*e,n.vy-=12*e,n.y+=n.vy*e,n.z+=n.vz*e,n.mesh.position.set(n.x,n.y,n.z)}n.life-=e,(n.life<=0||n.y!==void 0&&n.y<-1)&&(n.mesh&&i.remove(n.mesh),_.particles.splice(t,1))}}function Uy(i,e){for(let t=_.corpses.length-1;t>=0;t--){const n=_.corpses[t];if(n.deathTime-=e,n.deathTime<=0){i.remove(n.mesh),_.corpses.splice(t,1);continue}n.vy=(n.vy||0)-_.gravity*e,n.mesh.position.x+=(n.vx||0)*e,n.mesh.position.y+=n.vy*e,n.mesh.position.z+=(n.vz||0)*e,n.mesh.rotation.x+=(n.rx||0)*e,n.mesh.rotation.y+=(n.ry||0)*e,n.mesh.rotation.z+=(n.rz||0)*e,n.mesh.position.y<.1&&(n.mesh.position.y=.1,n.vy=0,n.vx=(n.vx||0)*.5,n.vz=(n.vz||0)*.5)}}function Ny(i,e,t,n,s){const r=i;for(let o=0;o<e.length;o++){const a=e[o];r[o*3]+=a.vx*.016,r[o*3+1]+=a.vy*.016,r[o*3+2]+=a.vz*.016,r[o*3]<0&&(r[o*3]=n),r[o*3]>n&&(r[o*3]=0),r[o*3+1]>3&&(r[o*3+1]=0),r[o*3+2]<0&&(r[o*3+2]=s),r[o*3+2]>s&&(r[o*3+2]=0)}t.attributes.position.needsUpdate=!0}function Oy(i,e,t,n,s,r){const o=document.createElement("canvas");o.width=64,o.height=32;const a=o.getContext("2d");a.fillStyle=r?"#ffff00":"#ff4444",a.shadowColor="#000",a.shadowBlur=3,a.font="bold 24px monospace",a.textAlign="center",a.fillText(Math.round(s).toString(),32,24);const c=new ns(o),l=new hf({map:c,transparent:!0,depthTest:!1}),h=new Nm(l);h.position.set(e+(Math.random()-.5)*.3,t+1.8,n+(Math.random()-.5)*.3),h.scale.set(.4,.2,1),h.renderOrder=1001,i.add(h),_.damageNumbers.push({sprite:h,life:1,vy:1.5})}function Fy(i,e){for(let t=_.damageNumbers.length-1;t>=0;t--){const n=_.damageNumbers[t];n.life-=e,n.sprite.position.y+=n.vy*e,n.sprite.material.opacity=n.life,n.life<=0&&(i.remove(n.sprite),_.damageNumbers.splice(t,1))}}let yr=null;function zy(i){yr=i}function By(i,e){for(const t of _.physicsBarrels){if(t.hasExploded||t.grounded)continue;t.vy-=_.gravity*e;const n=t.x+t.vx*e,s=t.z+t.vz*e,r=t.mesh.position.y+t.vy*e,o=t.mesh.userData.baseY||.45,a=48,c=48,l=n<=.6||n>=a-.6||s<=.6||s>=c-.6;if(r<=o||l){if((Math.abs(t.vy)>5||l&&Math.abs(t.vx)+Math.abs(t.vz)>8)&&yr&&!t.hasExploded){yr(t.mesh,i),t.hasExploded=!0;continue}if(t.mesh.position.y=o,t.vy=-t.vy*.3,t.vx*=.55,t.vz*=.55,Math.abs(t.vy)<.8&&Math.abs(t.vx)<1&&Math.abs(t.vz)<1){t.grounded=!0,t.vy=0,t.vx=0,t.vz=0,t.spinning=!1,t.x=Math.max(.6,Math.min(a-.6,n)),t.z=Math.max(.6,Math.min(c-.6,s)),t.mesh.position.x=t.x,t.mesh.position.z=t.z;continue}l&&(t.vx*=-.5,t.vz*=-.5)}const u=Math.max(.6,Math.min(a-.6,n)),f=Math.max(.6,Math.min(c-.6,s));if(t.x=u,t.z=f,t.mesh.position.x=u,t.mesh.position.y=Math.max(o,r),t.mesh.position.z=f,t.spinning&&(t.mesh.rotation.x+=(t._rx||4)*e,t.mesh.rotation.z+=(t._rz||4)*e),!t.hasExploded&&yr)for(const d of _.enemies){if(d.dead)continue;const g=d.mesh?d.mesh.position.y:0;if(Math.sqrt((d.x-t.x)**2+(g-t.mesh.position.y)**2+(d.z-t.z)**2)<1){yr(t.mesh,i),t.hasExploded=!0;break}}}}let bt=null,xn=null;new la;new P;5+_.wave*2;function ky(i,e,t,n){bt=i,xn=t}const Hy=ai(64,64,(i,e,t)=>{i.fillStyle="#4B5320",i.fillRect(0,0,e,t);const n=["#2D3319","#3B4024","#5C6A2E","#6B7339","#3F4A1F","#222D13"];for(let s=0;s<120;s++)i.fillStyle=n[Math.floor(Math.random()*n.length)],i.fillRect(Math.random()*e,Math.random()*t,3+Math.random()*8,2+Math.random()*6)}),Gy=ai(64,64,(i,e,t)=>{i.fillStyle="#3A2020",i.fillRect(0,0,e,t);const n=["#2A1515","#4A2828","#5A3030","#301A1A","#200E0E"];for(let s=0;s<120;s++)i.fillStyle=n[Math.floor(Math.random()*n.length)],i.fillRect(Math.random()*e,Math.random()*t,3+Math.random()*8,2+Math.random()*6)}),Vy=ai(64,64,(i,e,t)=>{i.fillStyle="#5A5040",i.fillRect(0,0,e,t);const n=["#4A4030","#6A5A48","#7A6A55","#3A3020","#5A4A38"];for(let s=0;s<120;s++)i.fillStyle=n[Math.floor(Math.random()*n.length)],i.fillRect(Math.random()*e,Math.random()*t,3+Math.random()*8,2+Math.random()*6)});function Uf(i){const e=new vt,t=i==="heavy"?1.2:i==="ranger"?.9:1,n=new ue({map:i==="heavy"?Gy:i==="ranger"?Vy:Hy,roughness:.85}),s=new ue({color:1710618,roughness:.9}),r=new ue({color:3815978,roughness:.7,metalness:.1}),o=new ue({color:2763290,roughness:.7});[-.12,.12].forEach(v=>{const m=new H(new Fe(.16*t,.22,.22*t),s);m.position.set(v*t,.11,0),m.castShadow=!0,e.add(m)}),e.userData.limbs={},[-.12,.12].forEach(v=>{const m=new Fe(.16*t,.5*t,.18*t);m.translate(0,-.25*t,0);const p=new H(m,n);p.position.set(v*t,.72*t,0),p.castShadow=!0,p.name=v<0?"lLeg":"rLeg",e.userData.limbs[p.name]=p,e.add(p)});const a=new H(new Fe(.46*t,.06,.22*t),o);a.position.set(0,.72*t,0),e.add(a);const c=new H(new Fe(.44*t,.55*t,.28*t),n);if(c.position.set(0,1.02*t,0),c.castShadow=!0,e.add(c),i!=="ranger"){const v=new H(new Fe(.48*t,.35*t,.32*t),r);v.position.set(0,1.05*t,0),e.add(v)}[-.3,.3].forEach(v=>{const m=new Fe(.13*t,.5*t,.13*t);m.translate(0,-.25*t,0);const p=new H(m,n);p.position.set(v*t,1.15*t,0),p.castShadow=!0,p.name=v<0?"lArm":"rArm",e.userData.limbs[p.name]=p,e.add(p)});const l=new ue({color:i==="heavy"?9071178:12883306,roughness:.8}),h=new ue({color:3883044,roughness:.6,metalness:.2}),u=new H(new Fe(.28*t,.28*t,.28*t),l);u.position.set(0,1.55*t,0),u.castShadow=!0,e.add(u);const f=new H(new mt(.18*t,8,8),h);f.position.set(0,1.62*t,0),e.add(f);const d=new ue({color:1710618,roughness:.7}),g=new H(new Fe(.04,.04,.35),d);return g.position.set(.22*t,1.1*t,-.1),e.add(g),e}function Wy(){const i=new vt,e=new mt(.35,10,8);e.scale(1,.85,.9);const t=new ue({color:13945008,roughness:.8,metalness:.05}),n=new H(e,t);n.position.y=1.3,i.add(n),[-.14,.14].forEach(c=>{const l=new H(new mt(.06,8,8),new nt({color:16737792,transparent:!0,opacity:.9}));l.position.set(c,1.35,.28);const h=new An(16729088,1.2,1.5);h.position.copy(l.position),i.add(l),i.add(h)});const s=new H(new Fe(.28,.12,.22),new ue({color:13945008,roughness:.8}));s.position.set(0,1.16,.05),i.add(s);const r=new H(new Ko?new Ko(.18,.5,4,8):new Xe(.18,.22,.7,8),new ue({color:2763306,roughness:.9}));r.position.y=.75,i.add(r);const o=new ue({color:3355443,roughness:.85}),a=new H(new Xe(.03,.06,.5,6),o);return a.position.set(0,.6,.28),a.rotation.x=.8,i.add(a),i}function Xy(){const i=new vt,e=new ue({color:13373713,roughness:.4,metalness:.7}),t=new H(new Xe(.22,.18,.1,6),e);t.castShadow=!0,i.add(t);const n=new nt({color:16711680}),s=new H(new Xe(.06,.06,.02,5),n);s.position.y=-.06,i.add(s);const r=new ue({color:2236962,roughness:.6,metalness:.5});[0,Math.PI/2,Math.PI,Math.PI*1.5].forEach((u,f)=>{const d=new H(new Fe(.38,.03,.04),r);d.rotation.y=u,d.castShadow=!0,i.add(d);const g=new nt({color:3355443,transparent:!0,opacity:.6,side:Mt}),v=new H(new Di(.1,8),g);v.rotation.x=Math.PI/2,v.position.set(Math.cos(u)*.19,0,Math.sin(u)*.19),v.name=`prop_${f}`,i.add(v)});const o=new nt({color:16720384}),a=new H(new mt(.04,8,8),o);a.position.set(0,-.08,.18),i.add(a);const c=new An(16720384,1.5,2.5);c.position.copy(a.position),i.add(c);const l=new ue({color:1118481,roughness:.5,metalness:.8}),h=new H(new Xe(.04,.04,.18,6),l);return h.position.set(0,-.14,0),i.add(h),i}function Za(){if(!bt||!xn)return;const i=xn.position.x,e=xn.position.z,t=Math.random()*Math.PI*2,n=20+Math.random()*20,s=i+Math.cos(t)*n,r=e+Math.sin(t)*n,o=6+Math.random()*4,a=Xy();a.position.set(s,o,r),bt.add(a),_.enemies.push({mesh:a,type:"drone",hp:12,maxHp:12,speed:5.5,damage:20,score:75,x:s,z:r,altitude:o,baseScale:1,ranged:!0,shootCooldown:0,dead:!1,deathTime:0,aiState:"hunt",coverSpot:null,suppressionTimer:0,peekTimer:0,recentlyHit:!1,frozen:!1,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,dropBombTimer:2e3+Math.random()*3e3,lastBomb:0})}function $y(){if(!bt)return;const i=Wy();let e,t;do e=Math.random()*(Zt-4)+2,t=Math.random()*(Jt-4)+2;while(Xt(e,t,.5));i.position.set(e,0,t),bt.add(i),_.raccoons.push({mesh:i,hp:8,x:e,z:t,speed:3.5})}function qy(){const i=new vt,e=1.4,t=new ue({color:4870208,roughness:.7}),n=new ue({color:1118481,roughness:.8}),s=new ue({color:2763306,roughness:.6}),r=new nt({color:16711680}),o=new ue({color:12883306,roughness:.8}),a=new ue({color:3359846,roughness:.3,metalness:.8,transparent:!0,opacity:.7});[-.15,.15].forEach(x=>{const D=new H(new Fe(.2*e,.3,.22*e),n);D.position.set(x*e,.15,0),i.add(D);const R=new Fe(.2*e,.55*e,.2*e);R.translate(0,-.275*e,0);const A=new H(R,t);A.position.set(x*e,.85*e,0),i.add(A)});const c=new H(new Fe(.6*e,.6*e,.32*e),t);c.position.set(0,1.1*e,0),i.add(c);const l=new H(new Fe(.62*e,.12,.33*e),new ue({color:13369344,roughness:.6}));l.position.set(0,1.1*e,0),i.add(l);for(let x=0;x<4;x++){const D=new H(new mt(.04,6,6),new ue({color:14526976,metalness:.9,roughness:.1}));D.position.set(-.18*e+x*.12,1.25*e,.17*e),i.add(D)}[-.38,.38].forEach((x,D)=>{const R=new Fe(.16*e,.55*e,.16*e);R.translate(0,-.275*e,0);const A=new H(R,t);A.position.set(x*e,1.25*e,0),A.castShadow=!0,A.name=D===0?"lArm":"rArm",i.userData.limbs=i.userData.limbs||{},i.userData.limbs[A.name]=A,i.add(A)});const h=new H(new Fe(.34*e,.34*e,.3*e),o);h.position.set(0,1.7*e,0),i.add(h);const u=new H(new Xe(.26*e,.26*e,.04,12),s);u.position.set(0,1.85*e,0),i.add(u);const f=new H(new Xe(.18*e,.22*e,.14,12),s);f.position.set(0,1.95*e,0),i.add(f);const d=new H(new Xe(.06,.06,.02,5),r);d.position.set(0,2.03*e,.17*e),i.add(d);const g=new An(16711680,1.5,2);g.position.set(0,2*e,.2*e),i.add(g);const v=new vt,m=new H(new Xe(.04,.12,.3,8),new ue({color:2236962,metalness:.7}));m.rotation.z=Math.PI/2,v.add(m);const p=new H(new ca(.16,.2,8),new ue({color:3355443,metalness:.6}));p.rotation.z=-Math.PI/2,p.position.x=.2,v.add(p),v.position.set(-.55*e,1.1*e,-.1),i.add(v);const E=new H(new Fe(.08,.9*e,.55*e),a);E.position.set(.55*e,1*e,0);const y=new H(new Xe(.12,.12,.05,5),r);return y.rotation.x=Math.PI/2,y.position.set(.6*e,1.2*e,0),i.add(E),i.add(y),i.userData.isCommissar=!0,i.userData.limbs=i.userData.limbs||{},i}function Yy(){if(!bt||!xn)return;const i=xn.position.x,e=xn.position.z,t=Math.random()*Math.PI*2;let n,s;do n=i+Math.cos(t)*(18+Math.random()*8),s=e+Math.sin(t)*(18+Math.random()*8);while(Xt(n,s,.8));const r=qy();r.position.set(n,0,s),r.scale.setScalar(1.1),bt.add(r);const o=new An(16720384,4,12);o.position.set(n,3,s),bt.add(o),setTimeout(()=>bt.remove(o),3e3),_.enemies.push({mesh:r,type:"commissar",hp:300,maxHp:300,speed:2,damage:30,score:500,x:n,z:s,baseScale:1.1,ranged:!0,shootCooldown:0,dead:!1,deathTime:0,aiState:"ADVANCE",coverSpot:null,suppressionTimer:0,peekTimer:0,recentlyHit:!1,frozen:!1,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,shieldActive:!0,reinforceTimer:15,megaphoneTimer:5}),st("☭ THE COMMISSAR HAS ARRIVED — 300 HP"),ir(()=>Promise.resolve().then(()=>$r),void 0).then(a=>{a.triggerCombatQuote("THE COMMISSAR APPROACHES!","#ff0000")})}function As(i="grunt"){if(!bt||!xn)return;const e={grunt:{hp:15,speed:2.5,damage:12,score:10,ranged:!1,scale:1},heavy:{hp:40,speed:1.6,damage:20,score:30,ranged:!1,scale:1.2},ranger:{hp:10,speed:2,damage:8,score:20,ranged:!0,scale:.9},raccoon:{hp:8,speed:3.5,damage:15,score:50,ranged:!1,scale:1}},t=e[i]||e.grunt,n=Uf(i==="raccoon"?"grunt":i);let s,r;do s=Math.random()*(Zt-4)+2,r=Math.random()*(Jt-4)+2;while(Xt(s,r,.5)||Math.hypot(s-xn.position.x,r-xn.position.z)<8);n.position.set(s,0,r),bt.add(n),_.enemies.push({mesh:n,type:i,hp:t.hp,maxHp:t.hp,speed:t.speed,damage:t.damage,score:t.score,x:s,z:r,baseScale:t.scale,ranged:t.ranged,shootCooldown:0,dead:!1,deathTime:0,aiState:null,coverSpot:null,suppressionTimer:0,peekTimer:0,recentlyHit:!1,frozen:!1,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0})}function jy(i,e,t,n){const s=i-t,r=e-n,o=Math.sqrt(s*s+r*r)||1,a=s/o,c=r/o;for(let l=2;l<=5;l++)for(let h=-1.2;h<=1.2;h+=.4){const u=i+Math.cos(Math.atan2(c,a)+h)*l,f=e+Math.sin(Math.atan2(c,a)+h)*l;if(u>1&&u<Zt-1&&f>1&&f<Jt-1&&!Xt(u,f,.5)){const d=(u+t)/2,g=(f+n)/2;if(Xt(d,g,.3))return{x:u,z:f}}}return null}function pi(i,e=!1,t=null){if(!bt)return;if(i.dead=!0,i.type==="commissar"){st("☭ THE COMMISSAR HAS FALLEN! CANADA WINS!"),_.screenShake=1.5,_.shakeIntensity=.4;for(let u=0;u<40;u++)vn(bt,i.x,1.5,i.z,16711680);for(let u=0;u<20;u++)vn(bt,i.x,1.5,i.z,16763904);ir(()=>Promise.resolve().then(()=>$r),void 0).then(u=>{u.triggerCombatQuote("THE COMMISSAR IS DOWN! CANADA WINS!","#ffcc00")})}const n=i.x,s=1,r=i.z,o=_.captureZones.filter(u=>u.captured).length,a=i.score*(e?2:1)*(1+Math.floor(_.combo/3))*(1+o*.5);_.score+=a,_.kills++,_.combo++,_.lastKillTime=performance.now(),_.combo>_.bestCombo&&(_.bestCombo=_.combo);const c=t||new P((Math.random()-.5)*5,3,(Math.random()-.5)*5);i.vx=c.x,i.vy=c.y,i.vz=c.z,i.rx=(Math.random()-.5)*10,i.ry=(Math.random()-.5)*10,i.rz=(Math.random()-.5)*10;const l=["death1","death2","death3"];if(Et(l[Math.floor(Math.random()*l.length)]),i.type==="drone"){st("🛸 DRONE DOWN +"+a),Wn("headshot");for(let f=0;f<12;f++)vn(bt,n,i.altitude||7,r,16729088);_.enemies.filter(f=>!f.dead&&f.type==="drone").length===0&&setTimeout(()=>st("✅ CLEAR SKIES — ALL DRONES NEUTRALIZED"),200)}else e?(Et("headshot"),_.headshots=(_.headshots||0)+1,st("OBLITERATED +"+a),_.screenShake=.2,_.shakeIntensity=.05,Wn("headshot")):(st("LIQUIDATED +"+a),_.combo>=3?Wn("multiKill"):Math.random()<.2&&Wn("kill"));for(let u=0;u<20;u++)vn(bt,n,s,r,e?16711680:13378082);i.type!=="drone"&&Lf(bt,n,r);const h=_.enemies.indexOf(i);for(h!==-1&&_.enemies.splice(h,1),i.deathTime=8,_.corpses.push(i);_.corpses.length>20;){const u=_.corpses.shift();u.mesh&&bt.remove(u.mesh)}if(Math.random()<.25){const u=["health","ammo","ammo","grenade"],f=u[Math.floor(Math.random()*u.length)],d={health:65348,ammo:16755200,grenade:16776960},g=f==="grenade"?new mt(.15,8,8):new Fe(.2,.2,.2),v=new ue({color:d[f],emissive:d[f],emissiveIntensity:.5}),m=new H(g,v);m.position.set(i.x,.5,i.z),bt.add(m),_.pickups.push({mesh:m,x:i.x,z:i.z,type:f})}Kc&&Kc(i)}function Ky(i){if(!xn)return;const e=xn.position.x,t=xn.position.z,n=performance.now();for(let s=_.enemies.length-1;s>=0;s--){const r=_.enemies[s];if(r.dead){_.enemies.splice(s,1);continue}r.aiState||(r.aiState=Math.random()<.3?"FLANK":"ADVANCE");let o=e-r.x,a=t-r.z,c=Math.sqrt(o*o+a*a)||1,l=o/c,h=a/c,u=!Xt((r.x+e)/2,(r.z+t)/2,.3);if(r.type==="drone"){if(r.frozen){r.frozenTimer!==void 0&&(r.frozenTimer-=i,r.frozenTimer<=0&&(r.frozen=!1)),r.mesh.position.x=r.x,r.mesh.position.z=r.z,r.mesh.position.y=ut.lerp(r.mesh.position.y,r.altitude||7,i*2);continue}r.mesh.children.forEach(m=>{m.name&&m.name.startsWith("prop_")&&(m.rotation.y+=i*40)});const v=r.altitude+Math.sin(n*.002+r.x)*.4;if(r.mesh.position.y=ut.lerp(r.mesh.position.y,v,i*3),c>12?(r.x+=l*r.speed*i,r.z+=h*r.speed*i):c<6&&(r.x-=l*r.speed*.5*i,r.z-=h*r.speed*.5*i),r.mesh.position.x=r.x,r.mesh.position.z=r.z,r.mesh.rotation.y+=i*1.2,c<15&&Math.random()<i*.5&&Et("drone_buzz"),c<20&&n-r.lastBomb>r.dropBombTimer){r.lastBomb=n,r.dropBombTimer=2500+Math.random()*3e3;const m=new mt(.12,6,6),p=new ue({color:3355443,roughness:.5,metalness:.8}),E=new H(m,p);E.position.set(r.x,r.mesh.position.y,r.z),bt.add(E),_.projectiles.push({mesh:E,vx:(Math.random()-.5)*3,vy:-4,vz:(Math.random()-.5)*3,damage:r.damage,life:3,type:"drone_bomb",targetX:e,targetZ:t}),Math.random()<.4&&(Wn("Drone overhead — take cover!"),ir(()=>Promise.resolve().then(()=>$r),void 0).then(y=>y.triggerCombatQuote("DRONE! GET DOWN!","#ff4400")))}continue}if(r.type==="commissar"){if(r.mesh.lookAt(e,r.mesh.position.y,t),c>4){const m=l*r.speed*i,p=h*r.speed*i;Xt(r.x+m,r.z,.6)||(r.x+=m),Xt(r.x,r.z+p,.6)||(r.z+=p)}else n-r.shootCooldown>1200&&(r.shootCooldown=n,Cs(r.damage,r.x,r.z),_.screenShake=.5,_.shakeIntensity=.15,Et("hit"));if(r.ranged&&u&&c<20&&n-r.shootCooldown>2500&&(r.shootCooldown=n,Et("shoot"),Math.random()>.3&&Cs(r.damage*.6,r.x,r.z),st('☭ COMMISSAR: "SUBMIT TO THE COLLECTIVE!"')),r.reinforceTimer-=i,r.reinforceTimer<=0){r.reinforceTimer=15,st("☭ COMMISSAR CALLS REINFORCEMENTS");for(let m=0;m<3;m++)setTimeout(()=>As(Math.random()<.5?"heavy":"grunt"),m*800)}const v=Math.sin(n*.005)*.5;r.mesh.userData.limbs?.lArm&&(r.mesh.userData.limbs.lArm.rotation.x=v),r.mesh.userData.limbs?.rArm&&(r.mesh.userData.limbs.rArm.rotation.x=-v),r.mesh.position.x=r.x,r.mesh.position.z=r.z;continue}r.suppressionTimer>0&&(r.suppressionTimer-=i,r.suppressionTimer<=0&&(r.aiState="ADVANCE")),r.recentlyHit&&(r.recentlyHit=!1,r.aiState="SUPPRESSED",r.suppressionTimer=2,r.coverSpot=jy(r.x,r.z,e,t));let f=r.speed*i,d=r.x,g=r.z;if(r.aiState==="SUPPRESSED"){if(r.mesh.position.y=ut.lerp(r.mesh.position.y,-.6,i*8),r.coverSpot){let v=r.coverSpot.x-r.x,m=r.coverSpot.z-r.z,p=Math.sqrt(v*v+m*m)||1;p>.5?(d+=v/p*f*1.5,g+=m/p*f*1.5):r.coverSpot=null}}else r.aiState==="FLANK"?(r.mesh.position.y=ut.lerp(r.mesh.position.y,0,i*5),d+=-h*f,g+=l*f,c<8&&(r.aiState="ADVANCE")):r.aiState==="ADVANCE"?(r.mesh.position.y=ut.lerp(r.mesh.position.y,0,i*5),c>3?(d+=l*f,g+=h*f):n-r.shootCooldown>1500&&(r.shootCooldown=n,Cs(r.damage,r.x,r.z),Et("hit")),u&&c<15&&Math.random()<.05&&(r.aiState="PEEK_FIRE")):r.aiState==="PEEK_FIRE"&&(r.mesh.position.y=ut.lerp(r.mesh.position.y,0,i*5),u&&r.ranged&&n-r.shootCooldown>2e3&&(r.shootCooldown=n,Et("shoot"),Math.random()>.5&&Cs(r.damage,r.x,r.z)),Math.random()<.02&&(r.aiState="ADVANCE"));if(Xt(d,r.z,.5)||(r.x=d),Xt(r.x,g,.5)||(r.z=g),r.netId&&r.targetX!==void 0&&(r.x=ut.lerp(r.x,r.targetX,.25),r.z=ut.lerp(r.z,r.targetZ,.25)),r.mesh.position.x=r.x,r.mesh.position.z=r.z,r.mesh.lookAt(e,r.mesh.position.y,t),r.aiState!=="PEEK_FIRE"&&r.suppressionTimer<=0&&r.mesh.userData.limbs){const v=n*.008,m=Math.sin(v)*.8;r.mesh.userData.limbs.lLeg&&(r.mesh.userData.limbs.lLeg.rotation.x=m),r.mesh.userData.limbs.rLeg&&(r.mesh.userData.limbs.rLeg.rotation.x=-m),r.mesh.userData.limbs.lArm&&(r.mesh.userData.limbs.lArm.rotation.x=-m),r.mesh.userData.limbs.rArm&&(r.mesh.userData.limbs.rArm.rotation.x=m)}}_.raccoons.forEach((s,r)=>{const o=e-s.x,a=t-s.z,c=Math.sqrt(o*o+a*a)||1,l=o/c,h=a/c,u=s.x+l*s.speed*i,f=s.z+h*s.speed*i;Xt(u,s.z,.4)||(s.x=u),Xt(s.x,f,.4)||(s.z=f),s.mesh.position.x=s.x,s.mesh.position.z=s.z,s.mesh.lookAt(e,s.mesh.position.y,t),c<1.2&&(Cs(15,s.x,s.z),bt.remove(s.mesh),_.raccoons.splice(r,1),_.score+=50,_.kills++)});for(let s=_.projectiles.length-1;s>=0;s--){const r=_.projectiles[s];if(r.type!=="drone_bomb")continue;r.life-=i,r.vy-=12*i,r.mesh.position.x+=r.vx*i,r.mesh.position.y+=r.vy*i,r.mesh.position.z+=r.vz*i;const o=r.mesh.position.x-e,a=r.mesh.position.z-t,c=Math.sqrt(o*o+a*a);if(r.mesh.position.y<=.1||c<2||r.life<=0){for(let l=0;l<12;l++)vn(r.mesh.position.x,.2,r.mesh.position.z,(Math.random()-.5)*8,Math.random()*6,(Math.random()-.5)*8);c<5&&Cs(r.damage*(1-c/5),r.mesh.position.x,r.mesh.position.z),bt.remove(r.mesh),_.projectiles.splice(s,1)}}}function jc(i,e,t,n){if(!bt)return null;const s={grunt:{hp:15,speed:2.5,damage:12,score:10,ranged:!1,scale:1},heavy:{hp:40,speed:1.6,damage:20,score:30,ranged:!1,scale:1.2},ranger:{hp:10,speed:2,damage:8,score:20,ranged:!0,scale:.9}},r=s[i]||s.grunt,o=Uf(i);o.position.set(e,0,t),bt.add(o);const a={mesh:o,type:i,hp:r.hp,maxHp:r.hp,speed:r.speed,damage:r.damage,score:r.score,x:e,z:t,baseScale:r.scale,ranged:r.ranged,shootCooldown:0,dead:!1,deathTime:0,aiState:null,coverSpot:null,suppressionTimer:0,peekTimer:0,recentlyHit:!1,frozen:!1,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,netId:n,targetX:e,targetZ:t,serverRotation:0};return _.enemies.push(a),a}let Kc=null;function Zy(i){Kc=i}let Zc=null;function Jy(i){Zc=i}function Cs(i,e,t){Zc&&Zc(i,e,t)}const No=new Set;function Qy(){const i=document.createElement("canvas");i.width=64,i.height=64;const e=i.getContext("2d");e.fillStyle="#1a1a1a",e.fillRect(0,0,64,64),e.fillStyle="#252525";for(let t=0;t<64;t+=4)for(let n=0;n<64;n+=4)(n+t)%8===0&&e.fillRect(n,t,3,3);e.strokeStyle="#0a0a0a",e.lineWidth=1;for(let t=8;t<64;t+=8)e.beginPath(),e.moveTo(0,t),e.lineTo(64,t),e.stroke();return new ns(i)}function eM(){const i=document.createElement("canvas");i.width=64,i.height=64;const e=i.getContext("2d");e.fillStyle="#1e1e22",e.fillRect(0,0,64,64);for(let t=0;t<64;t++){const n=28+Math.random()*8;e.fillStyle=`rgb(${n},${n},${n+2})`,e.fillRect(0,t,64,1)}return new ns(i)}const Qo=Qy();Qo.wrapS=Qo.wrapT=mi;Qo.repeat.set(2,3);const ea=eM();ea.wrapS=ea.wrapT=mi;ea.repeat.set(2,2);const Lt=new ue({color:1710622,metalness:.95,roughness:.15,map:ea});new ue({color:2763312,metalness:.9,roughness:.2});const Si=new ue({color:1710618,metalness:0,roughness:.4,map:Qo}),tM=new ue({color:1118481,metalness:0,roughness:.95});new ue({color:657930,metalness:.5,roughness:.8});const nM=new ue({color:13382451,metalness:.7,roughness:.3}),iM=new nt({color:16711680,transparent:!0,opacity:.8});new nt({color:3368703,transparent:!0,opacity:.4,side:Mt});const ln=24;function kl(i){const e=new vt;function t(n,s,r,o,a=1){const c=n/2,l=s/2,h=new Fs;h.moveTo(-c,-l),h.lineTo(c,-l),h.lineTo(c,l*.7),h.lineTo(c*a,l),h.lineTo(-c*a,l),h.lineTo(-c,l*.7),h.closePath();const u=new Ji(h,{depth:r,bevelEnabled:!0,bevelThickness:.002,bevelSize:.002,bevelSegments:3});return u.center(),new H(u,o)}if(i==="rifle"){const n=[new ee(0,0),new ee(.016,0),new ee(.016,.025),new ee(.008,.03),new ee(.012,.035),new ee(.012,.045),new ee(.009,.05),new ee(.009,.38),new ee(0,.38)],s=new H(new Jo(n,ln),Lt);s.rotation.x=Math.PI/2,s.position.set(0,.02,-.55),e.add(s);const r=t(.05,.06,.2,Lt,.85);r.position.set(0,0,-.07),e.add(r);const o=new H(new Xe(.014,.014,.05,ln),Lt);o.rotation.x=Math.PI/2,o.position.set(0,.052,-.1),e.add(o);const a=new H(new mt(.002,8,8),iM);a.position.set(0,.052,-.125),e.add(a);const c=new H(new Xe(.014,.016,.18,ln),Lt);c.rotation.x=Math.PI/2,c.position.set(0,0,.12),e.add(c);const l=t(.04,.065,.025,tM);l.position.set(0,-.005,.22),e.add(l);const h=new Fs;h.moveTo(-.014,0),h.lineTo(.014,0),h.lineTo(.012,-.07),h.quadraticCurveTo(0,-.078,-.012,-.07),h.closePath();const u=new Ji(h,{depth:.028,bevelEnabled:!0,bevelThickness:.002,bevelSize:.002,bevelSegments:2});u.center();const f=new H(u,Si);f.position.set(0,-.035,.04),f.rotation.x=.25,e.add(f);const d=t(.026,.105,.025,Lt);d.position.set(0,-.06,-.06),e.add(d)}else if(i==="shotgun"){const n=new H(new Xe(.012,.014,.5,ln),Lt);n.rotation.x=Math.PI/2,n.position.set(0,.025,-.35),e.add(n);const s=new H(new Xe(.011,.011,.38,ln),Lt);s.rotation.x=Math.PI/2,s.position.set(0,0,-.3),e.add(s);const r=t(.05,.065,.16,Lt,.9);r.position.set(0,.005,-.05),e.add(r);const o=new H(new Xe(.02,.022,.12,ln),Si);o.rotation.x=Math.PI/2,o.position.set(0,.01,-.2),e.add(o);const a=t(.04,.06,.2,Si);a.position.set(0,-.01,.15),e.add(a);const c=t(.03,.065,.028,Si);c.position.set(0,-.05,.05),c.rotation.x=.3,e.add(c);for(let l=0;l<4;l++){const h=new H(new Xe(.006,.006,.05,ln),nM);h.rotation.x=Math.PI/2,h.position.set(-.035,.005+l*.015,-.03),e.add(h)}}else if(i==="pistol"){const n=new Fs;n.moveTo(-.016,-.016),n.lineTo(.016,-.016),n.lineTo(.016,.012),n.lineTo(.014,.016),n.lineTo(-.014,.016),n.lineTo(-.016,.012),n.closePath();const s=new Ji(n,{depth:.17,bevelEnabled:!0,bevelThickness:.001,bevelSize:.001,bevelSegments:3});s.center();const r=new H(s,Lt);r.position.set(0,0,-.06),e.add(r);const o=new H(new Xe(.006,.006,.15,ln),Lt);o.rotation.x=Math.PI/2,o.position.set(0,.005,-.14),e.add(o);const a=t(.028,.065,.028,Si);a.position.set(0,-.045,.03),a.rotation.x=.15,e.add(a);const c=t(.022,.06,.022,Lt);c.position.set(0,-.04,.02),e.add(c)}else if(i==="sniper"){const n=[new ee(0,0),new ee(.012,0),new ee(.012,.025),new ee(.01,.035),new ee(.014,.04),new ee(.012,.08),new ee(.014,.12),new ee(.012,.16),new ee(.014,.2),new ee(.012,.24),new ee(.014,.28),new ee(.013,.32),new ee(.015,.5),new ee(0,.5)],s=new H(new Jo(n,ln),Lt);s.rotation.x=Math.PI/2,s.position.set(0,.025,-.68),e.add(s);const r=t(.05,.06,.22,Lt,.85);r.position.set(0,.005,-.08),e.add(r);const o=new H(new Xe(.016,.016,.18,ln),Lt);o.rotation.x=Math.PI/2,o.position.set(0,.075,-.05),e.add(o);const a=new H(new Xe(.022,.016,.04,ln),Lt);a.rotation.x=Math.PI/2,a.position.set(0,.075,-.16),e.add(a);const c=t(.025,.06,.026,Si);c.position.set(0,-.055,.05),c.rotation.x=.25,e.add(c);const l=t(.025,.07,.035,Lt);l.position.set(0,-.06,-.04),e.add(l)}else if(i==="lmg"){const n=new H(new Xe(.012,.014,.4,ln),Lt);n.rotation.x=Math.PI/2,n.position.set(0,.02,-.38),e.add(n);const s=t(.06,.07,.22,Lt,.9);s.position.set(0,0,-.05),e.add(s);const r=t(.05,.06,.055,new ue({color:3815978,metalness:.6,roughness:.4}));r.position.set(0,-.07,-.04),e.add(r);const o=t(.028,.065,.028,Si);o.position.set(0,-.055,.04),o.rotation.x=.25,e.add(o)}else if(i==="flamethrower"){const n=new H(new Xe(.04,.04,.3,ln),new ue({color:5583633,roughness:.8}));n.rotation.x=Math.PI/2,n.position.set(0,0,.05),e.add(n);const s=new H(new Xe(.006,.008,.4,ln),Lt);s.rotation.x=Math.PI/2,s.position.set(0,.02,-.3),e.add(s);const r=t(.025,.05,.025,Si);r.position.set(0,-.04,.04),e.add(r)}else if(i==="chainsaw")sM(e);else if(bn[i]&&bn[i].isWand){const n=new ue({color:4465169,roughness:.9}),s=new H(new Xe(.015,.01,.6,8),n);s.rotation.x=Math.PI/2,s.position.set(0,0,-.2),e.add(s);const r=new nt({color:bn[i].color}),o=new H(new Ul(.04,1),r);o.position.set(0,0,-.5),e.add(o);const a=new An(bn[i].color,5,2);a.position.set(0,0,-.5),e.add(a)}else{const n=new H(new Fe(.04,.035,.35),Lt);n.position.set(0,0,-.1),e.add(n)}return i==="chainsaw"||(e.add(ta("right",i)),e.add(ta("left",i))),e}let Mr=null,Jc=null;function sM(i){const e=new ue({color:14702600,roughness:.52,metalness:.08}),t=new ue({color:1973790,roughness:.88,metalness:.04}),n=new ue({color:3684408,roughness:.8,metalness:.04}),s=new ue({color:9079434,roughness:.3,metalness:.92}),r=new ue({color:11184810,roughness:.15,metalness:.98}),o=new ue({color:986895,roughness:.99,metalness:0}),a=new ue({color:526344,roughness:.95});function c(ne,Q,Te,Ne){return new H(new Fe(ne,Q,Te),Ne)}function l(ne,Q,Te,Ne,ae){return new H(new Xe(ne,Q,Te,Ne),ae)}const h=c(.078,.055,.22,e);h.position.set(0,.01,-.065),i.add(h);const u=c(.068,.04,.185,t);u.position.set(0,-.033,-.055),i.add(u);const f=c(.06,.02,.1,e);f.position.set(0,.052,-.08),i.add(f);const d=c(.062,.003,.101,t);d.position.set(0,.042,-.08),i.add(d);const g=l(.024,.026,.05,12,t);g.rotation.z=Math.PI/2,g.position.set(-.062,.006,-.07),i.add(g);for(let ne=0;ne<3;ne++){const Q=l(.027,.027,.004,12,n);Q.rotation.z=Math.PI/2,Q.position.set(-.068,.006,-.06+ne*.015),i.add(Q)}const v=c(.028,.024,.05,e);v.position.set(.044,.026,.018),i.add(v);const m=l(.006,.006,.015,8,t);m.position.set(.044,.04,.018),i.add(m);const p=l(.013,.013,.014,12,new ue({color:13378048,roughness:.45,metalness:.2}));p.position.set(-.02,.052,-.04),i.add(p);const E=new H(new hi(.013,.003,6,14),new ue({color:8947848,metalness:.85,roughness:.2}));E.rotation.x=Math.PI/2,E.position.set(-.02,.058,-.04),i.add(E);const y=l(.01,.01,.012,10,t);y.position.set(.02,.05,-.04),i.add(y);const x=new H(new hi(.01,.002,6,12),r);x.rotation.x=Math.PI/2,x.position.set(.02,.055,-.04),i.add(x);const D=c(.02,.009,.015,new ue({color:15606272,roughness:.55}));D.position.set(0,.044,.038),i.add(D);const R=c(.014,.007,.012,t);R.position.set(.024,.044,.038),i.add(R);const A=l(.015,.017,.06,10,new ue({color:2763306,metalness:.72,roughness:.65}));A.rotation.z=Math.PI/2,A.position.set(-.062,-.01,-.065),i.add(A);for(let ne=0;ne<4;ne++){const Q=c(.003,.022,.015,a);Q.position.set(-.079,-.01,-.052+ne*.016),i.add(Q)}const I=c(.004,.028,.058,n);I.position.set(-.08,-.01,-.062),i.add(I);const T=c(.04,.026,.098,t);T.position.set(0,-.007,.09),i.add(T);const M=c(.032,.021,.082,o);M.position.set(0,-.007,.086),i.add(M);for(let ne=0;ne<6;ne++){const Q=c(.034,.004,.006,n);Q.position.set(0,-.007,.055+ne*.013),i.add(Q)}const L=c(.038,.028,.022,t);L.position.set(0,-.006,.143),i.add(L);const V=c(.022,.008,.04,n);V.position.set(0,-.023,.072),V.rotation.x=.35,i.add(V);const G=c(.024,.005,.025,t);G.position.set(0,-.03,.06),i.add(G);const j=c(.016,.007,.022,new ue({color:16729088,roughness:.6}));j.position.set(0,.01,.078),i.add(j);const U=l(.01,.011,.068,10,t);U.rotation.z=.55,U.position.set(-.032,.028,.01),i.add(U);const F=l(.01,.01,.076,10,t);F.rotation.x=Math.PI/2,F.position.set(0,.052,.01),i.add(F);const W=l(.01,.011,.068,10,t);W.rotation.z=-.55,W.position.set(.032,.028,.01),i.add(W);const N=l(.012,.012,.06,10,o);N.rotation.x=Math.PI/2,N.position.set(0,.052,.01),i.add(N);for(let ne=0;ne<4;ne++){const Q=l(.013,.013,.004,10,n);Q.rotation.x=Math.PI/2,Q.position.set(0,.052,-.01+ne*.018),i.add(Q)}const oe=c(.009,.058,.125,n);oe.position.set(.044,-.002,-.062),i.add(oe);const fe=c(.01,.002,.1,t);fe.position.set(.044,.022,-.062),i.add(fe);for(let ne=0;ne<2;ne++){const Q=l(.0075,.0075,.014,6,r);Q.rotation.x=Math.PI/2,Q.position.set(.051,ne===0?.012:-.014,-.05+ne*.022),i.add(Q);const Te=l(.011,.011,.004,10,n);Te.rotation.x=Math.PI/2,Te.position.set(.051,ne===0?.012:-.014,-.044+ne*.022),i.add(Te)}const ve=l(.006,.006,.016,8,r);ve.rotation.x=Math.PI/2,ve.position.set(.051,-.008,-.094),i.add(ve);const De=new vt,$e=c(.011,.028,.37,s);$e.position.set(0,0,0),De.add($e);const Y=c(.013,.012,.31,a);Y.position.set(0,0,.01),De.add(Y);const ce=c(.013,.004,.36,new ue({color:10066329,metalness:.95,roughness:.2}));ce.position.set(0,.016,-.002),De.add(ce);const be=ce.clone();be.position.set(0,-.016,-.002),De.add(be);for(let ne=0;ne<5;ne++){const Q=c(.013,.03,.003,r);Q.position.set(0,0,.08-ne*.072),De.add(Q)}const pe=l(.014,.014,.011,12,s);pe.rotation.x=Math.PI/2,pe.position.set(0,0,-.185),De.add(pe);const Ie=l(.006,.006,.014,8,r);Ie.rotation.x=Math.PI/2,Ie.position.set(0,0,-.188),De.add(Ie);const ze=new H(new hi(.01,.003,8,16),r);ze.rotation.x=Math.PI/2,ze.position.set(0,0,-.189),De.add(ze),De.position.set(.016,.001,-.185),i.add(De);const Ue=document.createElement("canvas");Ue.width=512,Ue.height=64;const He=Ue.getContext("2d");He.fillStyle="#3a3a3a",He.fillRect(0,0,512,64);const Je=40,Le=512/Je;for(let ne=0;ne<Je;ne++){const Q=ne*Le;He.fillStyle="#555",He.fillRect(Q+1,10,Le-2,44),He.fillStyle="#222",He.beginPath(),He.arc(Q+Le*.25,32,4,0,Math.PI*2),He.fill(),He.beginPath(),He.arc(Q+Le*.75,32,4,0,Math.PI*2),He.fill(),ne%4===1?(He.fillStyle="#888",He.fillRect(Q+2,0,Le-3,12),He.fillStyle="#aaa",He.fillRect(Q+2,0,Le-3,4)):ne%4===3&&(He.fillStyle="#888",He.fillRect(Q+2,52,Le-3,12),He.fillStyle="#aaa",He.fillRect(Q+2,60,Le-3,4)),ne%2===0&&(He.fillStyle="#666",He.fillRect(Q+3,8,Le*.4,8)),He.fillStyle="#222",He.fillRect(Q,8,2,48)}const w=new ns(Ue);w.wrapS=mi,w.wrapT=mi,w.repeat.set(3,1);const de=.016,se=[],le=64;for(let ne=0;ne<=le;ne++){const Q=ne/le*Math.PI*2,Te=Math.cos(Q),Ne=Math.sin(Q),ae=de*Math.sign(Ne)*Math.pow(Math.abs(Ne),.35),Se=-.185*Math.sign(Te)*Math.pow(Math.abs(Te),.18);se.push(new P(0,ae,Se))}const J=new pf(se,!1),ge=new vt;ge.userData.isChainsawChain=!0,ge.userData.chainOffset=0;const re=new ue({map:w,metalness:.85,roughness:.35,side:Mt}),C=new H(new Nl(J,128,.008,6,!1),re);C.userData.isChainTube=!0,ge.add(C);const S=new ue({color:8947848,metalness:.95,roughness:.12,emissive:1118481,emissiveIntensity:.3}),B=new ue({color:5592405,metalness:.9,roughness:.3});for(let ne=0;ne<24;ne++){const Q=ne/24,Te=J.getPoint(Q),Ne=J.getTangent(Q),ae=Te.y>.005;if(!(ne%2===0))continue;const Oe=new vt,Ge=new H(new Fe(.005,.01,.008),B);Oe.add(Ge);const we=new H(new Fe(.005,.006,.01),S);we.position.set(0,ae?.008:-.008,.001),Oe.add(we),Oe.position.copy(Te),Oe.lookAt(Te.clone().add(Ne)),ge.add(Oe)}ge.position.copy(De.position),i.add(ge),Mr=ge;const K=new An(16742144,1.8,.4);K.position.set(.016,.001,-.38),K.userData.isSawGlow=!0,i.add(K),Jc=K;const te=ta("right","chainsaw");te.position.set(.01,-.04,.072),te.rotation.set(.2,.1,.05),i.add(te);const q=ta("left","chainsaw");q.position.set(-.008,.03,.01),q.rotation.set(-1.45,.1,-.1),i.add(q)}function rM(i,e){Mr&&(Mr.userData.chainOffset+=e*1.8,Mr.children.forEach(t=>{t.isMesh&&t.userData.isChainTube&&t.material&&t.material.map&&(t.material.map.offset.x=Mr.userData.chainOffset%1,t.material.map.needsUpdate=!0)}),Jc&&(Jc.intensity=1.6+Math.sin(performance.now()*.04)*.4))}function ta(i,e){const t=i==="right",n=t?1:-1,s=new ue({color:2245802,roughness:.16,metalness:0}),r=new ue({color:2772684,roughness:.22,metalness:0}),o=new ue({color:1849497,roughness:.28,metalness:0}),a=new vt,c=new Fs;c.moveTo(-.026,-.025),c.lineTo(.026,-.025),c.lineTo(.03,.02),c.lineTo(-.03,.02),c.closePath();const l=new Ji(c,{depth:.055,bevelEnabled:!0,bevelThickness:.003,bevelSize:.003,bevelSegments:4});l.center();const h=new H(l,s);h.rotation.x=Math.PI/2,a.add(h);const u=new H(new mt(.028,8,6,0,Math.PI*2,0,Math.PI*.45),r);u.scale.set(1,.35,1),u.position.set(0,.004,0),a.add(u);const f=new H(new mt(.018,8,6),r);f.scale.set(1.2,.4,.9),f.position.set(n*.008,-.005,.018),a.add(f);for(let A=0;A<4;A++){const I=new H(new mt(.0085,7,6),r);I.scale.set(.8,.55,.7),I.position.set(n*(-.018+A*.013),.01,-.025),a.add(I)}const d=new vt,g=new H(new Xe(.012,.0105,.045,10),s);g.position.set(0,0,0),d.add(g);const v=new H(new mt(.013,8,6),r);v.scale.set(1,.7,1),v.position.set(0,.026,0),d.add(v);const m=new H(new Xe(.011,.012,.04,10),s);m.position.set(0,.05,0),d.add(m);const p=new H(new mt(.011,8,6),r);p.position.set(0,.072,0),d.add(p);for(let A=0;A<3;A++){const I=new H(new hi(.012,.0015,6,10),r);I.position.set(0,.018+A*.006,0),d.add(I)}d.position.set(n*.038,-.004,-.016),d.rotation.set(.4,0,n*-1.2),a.add(d),[{x:-.018,lp:.054,ld:.042,spread:-.04},{x:-.005,lp:.059,ld:.046,spread:-.01},{x:.008,lp:.054,ld:.042,spread:.01},{x:.02,lp:.044,ld:.034,spread:.04}].forEach((A,I)=>{const T=new vt,M=.01-I*6e-4,L=.009-I*6e-4,V=new H(new Xe(M,M+.001,A.lp,10),s);V.position.set(0,A.lp/2,0),T.add(V);const G=new H(new mt(M+.001,8,6),r);G.scale.set(1,.72,1.1),G.position.set(0,A.lp,0),T.add(G);for(let W=0;W<3;W++){const N=new H(new hi(M+.001,.0013,6,10),r);N.position.set(0,A.lp-.006+W*.004,0),T.add(N)}const j=new H(new Xe(L,L+.001,A.ld,10),s);j.position.set(0,A.lp+.006+A.ld/2,0),T.add(j);for(let W=0;W<2;W++){const N=new H(new hi(L+.001,.0012,6,10),r);N.position.set(0,A.lp+.006+A.ld-.006+W*.004,0),T.add(N)}const U=new H(new mt(L,8,6),r);U.position.set(0,A.lp+.01+A.ld,0),T.add(U);const F=new H(new mt(L*.85,6,4,0,Math.PI*2,0,Math.PI*.4),new ue({color:3364300,roughness:.08,metalness:0}));F.scale.set(.7,.25,1),F.position.set(0,A.lp+.01+A.ld+.002,.006),T.add(F),T.position.set(n*A.x,.014,-.03),T.rotation.set(-.35+I*.03,0,n*A.spread*.3),a.add(T)});const y=new H(new Xe(.028,.025,.04,12),s);y.rotation.x=Math.PI/2,y.position.set(0,-.008,.032),a.add(y);const x=new H(new Xe(.03,.028,.018,12),o);x.rotation.x=Math.PI/2,x.position.set(0,-.008,.048),a.add(x);const D=new H(new hi(.03,.004,8,14),o);D.rotation.x=Math.PI/2,D.position.set(0,-.008,.056),a.add(D);const R=new H(new Xe(.025,.026,.055,12),s);if(R.rotation.x=Math.PI/2,R.position.set(0,-.008,.075),a.add(R),e==="chainsaw"){const A=new nt({color:6684672,transparent:!0,opacity:.75});[[n*-.018,.068,-.08],[n*-.005,.074,-.076],[n*.008,.068,-.08],[.005,.01,-.04]].forEach(([T,M,L])=>{const V=new H(new mt(.003+Math.random()*.004,5,5),A);V.scale.y=.3,V.position.set(T,M,L),a.add(V)})}return e!=="chainsaw"&&(t?(a.position.set(.022,-.038,-.01),a.rotation.set(.18,.05,.04)):(a.position.set(-.018,-.028,-.22),a.rotation.set(.12,-.04,-.06))),a}let es,Zi,zs,Bs,Oo=0;function Nf(i){es=new H(new Kt(.22,.22),new nt({color:16755251,transparent:!0,opacity:0,side:Mt,depthWrite:!1,blending:Er})),es.position.set(0,.02,-.55),i.add(es),Zi=new H(new Kt(.16,.16),new nt({color:16777164,transparent:!0,opacity:0,side:Mt,depthWrite:!1,blending:Er})),Zi.position.set(0,.02,-.55),Zi.rotation.y=Math.PI/2,i.add(Zi),zs=new H(new Kt(.35,.35),new nt({color:16737792,transparent:!0,opacity:0,side:Mt,depthWrite:!1,blending:Er})),zs.position.set(0,.02,-.56),i.add(zs),Bs=new An(16746547,0,8,2),Bs.position.set(0,0,-.6),i.add(Bs)}function oM(i){Oo>0&&(Oo-=i,Oo<=0&&(es.material.opacity=0,Zi.material.opacity=0,zs.material.opacity=0,Bs.intensity=0))}let zt,Fn,ft,Qc,Wi,kr;function aM(i,e,t,n,s){zt=i,Fn=e,ft=t,Qc=n,kr=s,Wi=new la}function Of(){_.reloading||_.ammo===_.maxAmmo||_.paused||(_.reloading=!0,_.reloadStart=performance.now(),Et("reload"),Math.random()<.3&&Wn("reload"),document.getElementById("reloadBar").style.display="block")}function cM(i){if(!_.reloading)return;const e=i-_.reloadStart,t=Math.min(1,e/_.reloadTime),n=document.getElementById("reloadFill");n&&(n.style.width=t*100+"%"),t>=1&&(_.ammo=_.maxAmmo,_.reloading=!1,document.getElementById("reloadBar").style.display="none",Zn())}function Ff(){if(!_.alive||_.paused||!_.started)return;const i=bn[_.weapon];if(_.shootCooldown>0||_.reloading)return;if(_.ammo<=0&&_.weapon!=="chainsaw"){Et("hit"),Of();return}if(_.weapon!=="chainsaw"&&_.weapon!=="flamethrower"&&(_.ammo--,Zn()),_.shootCooldown=i.fireRate,i.isWand){Et("shoot"),lM();return}const e=_.aiming?.3:1;if(Qc&&(Qc.rotation.x+=i.recoil*e),_.mouse.y-=i.recoil*e,Oo=.06,es&&(es.material.opacity=1,es.rotation.z=Math.random()*Math.PI),Zi&&(Zi.material.opacity=1),zs&&(zs.material.opacity=.5),Bs&&(Bs.intensity=8),Et("shoot"),_.weapon==="flamethrower"){_.ammo-=.5;const s=new P(0,0,-1).applyQuaternion(Fn.quaternion).applyQuaternion(ft.quaternion);for(let r=0;r<4;r++)vn(zt,ft.position.x+s.x*.5,Fn.position.y+ft.position.y-.2,ft.position.z+s.z*.5,Math.random()>.5?16729088:16755200)}const t=i.pellets||1,n=_.aiming?i.spread*.2:i.spread*4;for(let s=0;s<t;s++){const r=(Math.random()-.5)*n,o=(Math.random()-.5)*n,a=new P(0,0,-1).applyQuaternion(Fn.quaternion).applyQuaternion(ft.quaternion);a.add(new P(r,o,0).applyQuaternion(Fn.quaternion).applyQuaternion(ft.quaternion)),a.normalize();const c=new Xe(.008,.008,.4,4);c.rotateX(Math.PI/2);const l=new H(c,new nt({color:16768324})),h=ft.position.clone();h.y+=Fn.position.y,l.position.copy(h),l.quaternion.copy(Fn.quaternion).premultiply(ft.quaternion),zt.add(l);const u=a.clone().multiplyScalar(120);_.projectiles.push({mesh:l,vx:u.x,vy:u.y,vz:u.z,life:.8,isTracer:!0});const f=ft.position.clone();f.y+=Fn.position.y,Wi.set(f,a),_.weapon==="chainsaw"?Wi.far=4:_.weapon==="flamethrower"?Wi.far=15:Wi.far=1/0;const d=Wi.intersectObjects(_.enemies.map(g=>g.mesh),!0);if(d.length>0){const g=d[0].object,v=_.enemies.find(m=>{if(m.dead)return!1;let p=g;for(;p;){if(p===m.mesh)return!0;p=p.parent}return!1});if(v){const m=d[0].point.y,p=m>1.5&&_.weapon!=="chainsaw"&&_.weapon!=="flamethrower",E=i.damage*(p?3:1);if(v.hp-=E,v.recentlyHit=!0,Et("hit"),by(p),Oy(zt,v.x,d[0].point.y,v.z,E,p),v.hp<=0)pi(v,p,a.clone().multiplyScalar(p?6:3));else if(_.weapon==="chainsaw"){const y=a.clone().negate();for(let x=0;x<18;x++){const R=y.x*(.3+Math.random()*.8)+(Math.random()-.5)*.6,A=y.z*(.3+Math.random()*.8)+(Math.random()-.5)*.6;vn(zt,v.x+R,m+(Math.random()-.3)*.8,v.z+A,Math.random()>.3?13369344:8912896)}}else for(let y=0;y<(p?8:3);y++)vn(zt,v.x,d[0].point.y,v.z,p?16711680:16737894);_.enemies.forEach(y=>{if(!y.dead&&y!==v){const x=y.x-d[0].point.x,D=y.z-d[0].point.z;x*x+D*D<9&&(y.recentlyHit=!0)}})}}else if(kr){const g=Wi.intersectObjects(kr.children,!0);if(g.length>0&&g[0].distance<50){const v=g[0].point;let m=null,p=g[0].object;for(;p;){if(p.userData&&p.userData.explosive===!0){m=p;break}p=p.parent}if(m&&!No.has(m))Hl(m,0);else for(let E=0;E<6;E++)vn(zt,v.x,v.y,v.z,Math.random()>.4?16755200:16777164)}}}}function Hl(i,e){if(!i||No.has(i))return;No.add(i);const t=i.position.x,n=i.position.y,s=i.position.z;i.parent&&i.parent.remove(i);for(let l=0;l<30;l++)vn(zt,t,n+.5,s,Math.random()>.5?16729088:16746496);_.screenShake=1.2,_.shakeIntensity=.6,Et("explosion"),st("💥 BARREL CHAIN REACTION");const r=ft?ft.position.x:0,o=ft?ft.position.z:0,a=r-t,c=o-s;Math.sqrt(a*a+c*c)<6&&Hr&&Hr(40),_.enemies.forEach(l=>{if(!l.dead){const h=l.x-t,u=l.z-s;Math.sqrt(h*h+u*u)<5&&pi(l,!1,new P(h,4,u).normalize().multiplyScalar(5))}}),e===0&&kr&&kr.children.forEach(l=>{if(l.userData&&l.userData.explosive===!0&&!No.has(l)){const h=l.position.x-t,u=l.position.z-s;Math.sqrt(h*h+u*u)<4&&setTimeout(()=>Hl(l,1),150+Math.random()*200)}})}function lM(i){if(!zt||!ft)return;const e=new la,t=ft.position.clone();t.y+=Fn?Fn.position.y:1.5;const n=new P(0,0,-1).applyQuaternion(Fn?.quaternion||new tr).applyQuaternion(ft.quaternion).normalize();e.set(t,n);const s=e.intersectObjects(zt.children,!0);let r=t.clone().add(n.clone().multiplyScalar(100));for(let o=0;o<s.length;o++)if(s[o].object.name!=="bullet"){r=s[o].point;break}if(_.weapon==="wand_fire"){_.screenShake=.5,_.shakeIntensity=.3,_.enemies.forEach(o=>{!o.dead&&o.mesh.position.distanceTo(r)<8&&pi(o,!1,new P((o.x-r.x)*10,20,(o.z-r.z)*10))});for(let o=0;o<30;o++)vn(zt,r.x,r.y+1,r.z,16729088)}else _.weapon==="wand_ice"?_.enemies.forEach(o=>{!o.dead&&o.mesh.position.distanceTo(r)<4&&(o.frozen=!0,o.speed=0,o.mesh.children.forEach(a=>{a.material&&(a.material=a.material.clone(),a.material.color.setHex(35071))}))}):_.weapon==="wand_lightning"?_.enemies.forEach(o=>{!o.dead&&o.mesh.position.distanceTo(r)<15&&pi(o,!0,new P(0,5,0))}):_.weapon==="wand_earth"&&(_.screenShake=.8,_.shakeIntensity=.5,_.enemies.forEach(o=>{!o.dead&&o.mesh.position.distanceTo(ft.position)<12&&pi(o,!1,new P(0,40,0))}))}function hM(i){if(!_.alive||_.paused||!_.started)return;Et("hit");const e=i.clone();e.y=0,e.normalize();const t=new H(new mt(1.5,4,4),new nt({color:16711680,wireframe:!0,visible:!1}));t.position.copy(ft.position),zt.add(t),_.projectiles.push({mesh:t,x:t.position.x,z:t.position.z,vx:e.x*40,vy:0,vz:e.z*40,life:.6,isBowling:!0,radius:2,dir:e}),_.screenShake=.4,_.shakeIntensity=.15;const n=document.getElementById("hitMarker");n&&(n.textContent="🥾",n.style.display="block",n.style.color="#ffffff",setTimeout(()=>n.style.display="none",200))}function uM(i,e){const t=ft?.position.x||0,n=ft?.position.z||0;for(let s=_.projectiles.length-1;s>=0;s--){const r=_.projectiles[s];if(r.type!=="drone_bomb")if(r.isBowling){if(r.x+=r.vx*e,r.z+=r.vz*e,r.mesh.position.x=r.x,r.mesh.position.z=r.z,r.life-=e,r.life<=0){i.remove(r.mesh),_.projectiles.splice(s,1);continue}_.enemies.forEach(o=>{if(o.dead)return;const a=o.x-r.x,c=o.z-r.z;a*a+c*c<r.radius*r.radius&&(pi(o,!1,new P(r.vx*.8,12,r.vz*.8)),r.vx*=.9,r.vz*=.9)}),_.corpses.forEach(o=>{if(!o.mesh)return;const a=o.x-r.x,c=o.z-r.z;a*a+c*c<r.radius*r.radius&&(o.vx=r.vx*.7,o.vy=8+Math.random()*4,o.vz=r.vz*.7,o.rx=(Math.random()-.5)*12,o.ry=(Math.random()-.5)*12,o.rz=(Math.random()-.5)*12,o.deathTime=Math.max(o.deathTime||0,3),r.vx*=.8,r.vz*=.8)}),_.physicsBarrels.forEach(o=>{if(o.hasExploded)return;const a=o.x-r.x,c=o.z-r.z;a*a+c*c<(r.radius+.5)*(r.radius+.5)&&(o.vx=r.vx*1.1,o.vy=6+Math.random()*3,o.vz=r.vz*1.1,o.grounded=!1,o.spinning=!0,r.vx*=.7,r.vz*=.7)})}else if(r.isTracer)r.mesh.position.x+=r.vx*e,r.mesh.position.y+=(r.vy||0)*e,r.mesh.position.z+=r.vz*e,r.life-=e,r.life<=0&&(i.remove(r.mesh),_.projectiles.splice(s,1));else{if(r.x+=r.vx*e,r.z+=r.vz*e,r.mesh.position.x=r.x,r.mesh.position.z=r.z,Math.sqrt((r.x-t)**2+(r.z-n)**2)<.5){Hr&&Hr(r.damage||10,r.x,r.z),i.remove(r.mesh),_.projectiles.splice(s,1);continue}Xt(r.x,r.z,.1)&&(i.remove(r.mesh),_.projectiles.splice(s,1))}}}function fM(i){if(!_.alive||_.paused||!_.started||_.grenadeCount<=0)return;_.grenadeCount--,Et("shoot"),Wn("grenade"),Zn();const e=i.clone();e.y=.5,e.normalize();const t=new mt(.1,8,8),n=new ue({color:16776960,emissive:11175936,emissiveIntensity:.5}),s=new H(t,n);s.position.copy(ft.position),s.position.y+=1.2,zt.add(s),_.grenades.push({mesh:s,x:s.position.x,y:s.position.y,z:s.position.z,vx:e.x*12,vy:7,vz:e.z*12,life:2.5})}function dM(i){if(!_.alive||_.paused||!_.started)return;if(_.empCount<=0){st("NO EMP GRENADES");return}_.empCount--,Zn(),Et("shoot"),st("⚡ EMP DEPLOYED");const e=i.clone();e.y=.4,e.normalize();const t=new Xe(.12,.12,.2,6),n=new ue({color:43775,emissive:26367,emissiveIntensity:1.5,metalness:.8}),s=new H(t,n);s.position.copy(ft.position),s.position.y+=1.2;const r=new An(43775,3,4);r.position.copy(s.position),zt.add(s),zt.add(r);let o=0;const a=setInterval(()=>{if(o+=.05,s.position.x+=e.x*.5,s.position.z+=e.z*.5,s.position.y+=e.y*.5-.05*o*2,r.position.copy(s.position),o>1||s.position.y<.1){clearInterval(a),zt.remove(s),zt.remove(r);const c=new H(new mt(.5,16,16),new nt({color:52479,transparent:!0,opacity:.5,wireframe:!0}));c.position.copy(s.position),zt.add(c);let l=0;const h=setInterval(()=>{l+=.6,c.scale.setScalar(l),c.material.opacity=Math.max(0,.5-l*.06),l>8&&(clearInterval(h),zt.remove(c))},30),u=s.position.x,f=s.position.z;let d=0;_.enemies.forEach(g=>{if(g.type!=="drone"||g.dead)return;Math.hypot(g.x-u,g.z-f)<8&&(g.frozen=!0,g.frozenTimer=5,d++,g.mesh.children.forEach(m=>{m.material&&(m._origColor=m.material.color?.getHex(),m.material.color?.setHex(35071))}),setTimeout(()=>{g.frozen=!1,g.mesh.children.forEach(m=>{m.material&&m._origColor!==void 0&&m.material.color?.setHex(m._origColor)})},5e3))}),d>0&&(st(`⚡ EMP: ${d} DRONE${d>1?"S":""} DISABLED (5s)`),ir(()=>Promise.resolve().then(()=>$r),void 0).then(g=>g.triggerCombatQuote("EMP! DRONES DOWN!","#00ccff")))}},50)}function pM(i,e){for(let t=_.grenades.length-1;t>=0;t--){const n=_.grenades[t];if(n.x+=n.vx*e,n.vy-=15*e,n.y+=n.vy*e,n.z+=n.vz*e,n.mesh.position.set(n.x,n.y,n.z),n.mesh.rotation.x+=e*5,n.mesh.rotation.z+=e*3,n.y<.15&&(n.y=.15,n.vy=Math.abs(n.vy)*.3,n.vx*=.7,n.vz*=.7),n.life-=e,n.life<=0){Et("explosion");for(let s=0;s<30;s++)vn(i,n.x,n.y,n.z,Math.random()>.5?16737792:16763904);_.enemies.forEach(s=>{if(s.dead)return;const r=Math.sqrt((s.x-n.x)**2+(s.z-n.z)**2);r<5&&(s.hp-=80*(1-r/5),s.hp<=0&&pi(s,!1))}),Lf(i,n.x,n.z),_.screenShake=.3,_.shakeIntensity=.08,i.remove(n.mesh),_.grenades.splice(t,1)}}}function mM(i,e){for(let t=_.pickups.length-1;t>=0;t--){const n=_.pickups[t];if(n.mesh.rotation.y+=e*2,n.mesh.position.y=.5+Math.sin(performance.now()/500)*.1,!ft)continue;const s=n.x-ft.position.x,r=n.z-ft.position.z;s*s+r*r<1.5&&(n.type==="health"?_.health=Math.min(100,_.health+50):n.type==="ammo"?_.ammo=_.maxAmmo:n.type==="grenade"&&(_.grenadeCount=Math.min(_.maxGrenades,_.grenadeCount+2)),Et("pickup"),i.remove(n.mesh),_.pickups.splice(t,1),Zn())}}function gM(i){if(!ft)return;const e=ft.position.x,t=ft.position.z;_.captureZones.forEach(n=>{if(n.beacon.intensity=1.5+Math.sin(performance.now()/200)*.5,n.captured)return;const s=e-n.x,r=t-n.z;s*s+r*r<16?(n.progress+=i*.2,n.screen.color.setHex(Math.random()>.5?16771584:16711680),n.progress>=1&&(n.captured=!0,n.progress=1,n.screen.color.setHex(65280),n.beacon.color.setHex(65280),n.beaconMesh.color.setHex(65280),st(`SEC 504 DECRYPTED: HUB ${n.name} BROADCASTING`),st(`✅ ${n.name} CAPTURED — 2× SCORE ACTIVE`),ir(()=>Promise.resolve().then(()=>$r),void 0).then(o=>o.triggerCombatQuote(`${n.name} SECURED!`,"#33ff99")),Et("pickup"))):n.progress>0&&(n.progress=Math.max(0,n.progress-i*.1),n.screen.color.setHex(16711680))})}let Hr=null;function _M(i){Hr=i}function vM(i,e,t){try{const g=new SpeechSynthesisUtterance("Powered by LIRIL A I. Guided by TENET 5. Target locked. Avro payload delivered. Fag.");g.pitch=.5,g.rate=1.1,window.speechSynthesis.speak(g)}catch{}st("AVRO ARROW MISSILE INBOUND");const n=new vt,s=new ue({color:15658734,metalness:.4,roughness:.3}),r=new ue({color:3355443,metalness:.6,roughness:.2}),o=new Xe(.3,.15,6,12);o.rotateX(Math.PI/2),n.add(new H(o,s));const a=new ca(.15,1.5,12);a.rotateX(-Math.PI/2);const c=new H(a,r);c.position.z=-3.75,n.add(c);const l=new Fs;l.moveTo(0,0),l.lineTo(2.5,-1.2),l.lineTo(.3,-2),l.lineTo(0,-1.8),l.closePath();const h=new Ji(l,{depth:.04,bevelEnabled:!1});[-1,1].forEach(g=>{const v=new H(h,s);v.scale.x=g,v.position.set(0,-.1,.5),v.rotation.x=Math.PI/2,n.add(v)});const u=e.clone();u.y=80,u.z+=40,n.position.copy(u),n.lookAt(e),n.scale.setScalar(1.5),i.add(n);let f=0;const d=setInterval(()=>{if(f+=.016,n.position.lerp(e,.08),n.lookAt(e),Math.random()>.5&&t(i,n.position.x,n.position.y,n.position.z,16746547),n.position.distanceTo(e)<2&&f>.2){Et("explosion"),_.screenShake=1.5,_.shakeIntensity=.4,_.enemies.forEach(g=>{!g.dead&&Math.hypot(g.x-e.x,g.z-e.z)<15&&pi(g,!0,new P(0,40,0))});for(let g=0;g<100;g++)t(i,e.x+(Math.random()-.5)*30,Math.random()*8,e.z+(Math.random()-.5)*30,Math.random()>.3?16737792:16720384);i.remove(n),clearInterval(d)}f>5&&(i.remove(n),clearInterval(d))},16)}const Ls=[{text:"EAT LEAD, YOU COMMIE FUCKS!",color:"#ff3333"},{text:"GET OFF MY LAWN!",color:"#ffcc00"},{text:"THE RED DUSTER NEVER SLEEPS!",color:"#ff3333"},{text:"I'VE BEEN WAITING FOR THIS SINCE '89!",color:"#ffffff"},{text:"QUACK QUACK, MOTHERFUCKERS!",color:"#ffcc00"},{text:"CANADA STANDS!",color:"#ff6600"},{text:"FOR THE RED ENSIGN!",color:"#ff3333"},{text:"BODY CHECK! THIS IS CANADA!",color:"#ff6600"},{text:"WELCOME TO HOCKEY SEASON!",color:"#ff3333"},{text:"THAT'S A PENALTY — WORTH IT.",color:"#ffcc00"},{text:"FIVE MINUTES FOR FIGHTING, EH!",color:"#ff6600"}];function Gl(i,e){const t=i||Ls[Math.floor(Math.random()*Ls.length)].text,n=e||Ls[Math.floor(Math.random()*Ls.length)].color,s=document.getElementById("comboText");s&&(s.textContent=t,s.style.color=n,s.style.display="block",s.style.opacity="1",clearTimeout(s._t),s._t=setTimeout(()=>{s.style.opacity="0",s.style.transform="scale(1.2)",setTimeout(()=>{s.style.transform="scale(1)"},100),setTimeout(()=>{s.style.display="none"},400)},2500))}function xM(){const i=Ls[Math.floor(Math.random()*Ls.length)];Gl(i.text,i.color)}const yM=[{time:500,text:"INTERCEPT — ENEMY COMMS: 'Battalion drone strike authorized. Finish exterminating the Canadians. 0300.'"},{time:3500,text:"SOLDIER: ...they're going to wipe out the whole battalion."},{time:6e3,text:"SOLDIER: Those are my people. My regiment. My brothers."},{time:8500,text:"ENEMY COMMANDER: Final order — deploy the swarm. Leave nothing."},{time:11e3,text:"SOLDIER: They had drone coordinates on every FOB. Every supply line. Every man."},{time:14e3,text:"SOLDIER: I had maybe four minutes. No radio. No air support. No other option."},{time:17500,text:"SOLDIER: *Grips the Red Duster*"},{time:19500,text:"SOLDIER: Not today."}];function zf(){let i=document.getElementById("introDlg");i||(i=document.createElement("div"),i.id="introDlg",i.style.cssText="position:fixed;bottom:120px;left:50%;transform:translateX(-50%);z-index:80;font-size:1.1em;color:#ffcc00;text-shadow:0 0 10px #000;letter-spacing:0.05em;pointer-events:none;text-align:center;max-width:600px;background:rgba(0,0,0,0.6);padding:8px 16px;border-left:3px solid #ff3333;",document.body.appendChild(i)),yM.forEach(({time:e,text:t})=>{setTimeout(()=>{i.textContent=t,i.style.opacity="1",clearTimeout(i._t),i._t=setTimeout(()=>{i.style.opacity="0"},1800)},e)})}const yu=["","CONTACT! Young Castro infiltrators spotted. Clear the area.","More hostiles inbound. Young Castro knows we're here.","They're sending everything. Hold the line against the state.","Regime snipers deployed. Watch the rooftops.","BOSS WAVE — Young Castro's Heavy armor incoming. Use explosives.","Intel says their command post is nearby. Push forward.","Reinforcements from the east. Dig in.","Young Castro is getting desperate. Expect human waves.","Almost through their line. One more push.","FINAL ASSAULT — Young Castro's vanguard. Make it count."];function Bf(i){const e=document.getElementById("waveIntroOverlay");if(!e)return;const t=i===10||i>10&&i%10===0;e.innerHTML=t?`<div class="wi-inner wi-boss">
        <div class="wi-label">⚠ BOSS WAVE</div>
        <div class="wi-num">WAVE ${i}</div>
        <div class="wi-sub">THE COMMISSAR IS COMING</div>
       </div>`:`<div class="wi-inner">
        <div class="wi-label">INCOMING</div>
        <div class="wi-num">WAVE ${i}</div>
        <div class="wi-sub">HOLD THE LINE</div>
       </div>`,e.style.display="flex",e.style.opacity="1",e.style.transition="",setTimeout(()=>{e.style.transition="opacity 0.6s",e.style.opacity="0",setTimeout(()=>{e.style.display="none",e.style.transition=""},650)},2e3)}function kf(i,e){const t=document.getElementById("waveBanner");if(!t)return;const n=yu[Math.min(i,yu.length-1)]||`Wave ${i} — They keep coming.`;t.innerHTML=`<div style="font-size:2em;margin-bottom:8px;">WAVE ${i}</div><div style="font-size:0.7em;color:#cc9966;letter-spacing:0.1em;">${n}</div>`,t.style.display="block",setTimeout(()=>{t.style.display="none"},3e3),st(`WAVE ${i} — ${n}`)}function Hf(){const i=document.getElementById("resupplyBanner");i&&(i.style.display="block",setTimeout(()=>{i.style.display="none"},2e3))}function Gf(i){["hud","hud-top","healthBar","crosshair","killFeed","grenadeHud","sprintBar","objectivesHud"].forEach(t=>{const n=document.getElementById(t);n&&(n.style.display="block")}),document.getElementById("menu").style.display="none";const e=document.getElementById("empHud");e&&(e.style.display="block"),document.getElementById("deathScreen").style.display="none",document.getElementById("pauseMenu").style.display="none"}function MM(){const i=document.getElementById("deathScreen");if(!i)return;i.style.display="flex",document.getElementById("finalScore").textContent=_.score.toLocaleString(),document.getElementById("finalWave").textContent=_.wave,document.getElementById("finalKills").textContent=_.kills,document.getElementById("finalHeadshots").textContent=_.headshots||0,document.getElementById("finalCombo").textContent=_.bestCombo||0;const e=parseInt(localStorage.getItem("redDusterHighScore")||"0");_.score>e?(localStorage.setItem("redDusterHighScore",_.score.toString()),document.getElementById("highScoreMsg").style.display="block",document.getElementById("highScoreVal").textContent=_.score.toLocaleString()):(document.getElementById("highScoreMsg").style.display="none",document.getElementById("highScoreVal").textContent=e.toLocaleString())}let Vf=null;function Wf(){const i=document.getElementById("minimap");i&&(i.width=150,i.height=150,Vf=i.getContext("2d"))}function Xf(i,e,t,n){const s=Vf;if(!s)return;s.fillStyle="#000000aa",s.fillRect(0,0,150,150);const r=150/e;for(let h=0;h<t;h++)for(let u=0;u<e;u++){const f=i[h][u];f===1?(s.fillStyle="#555",s.fillRect(u*r,h*r,r,r)):(f===2||f===3)&&(s.fillStyle="#444",s.fillRect(u*r,h*r,r,r))}_.enemies.forEach(h=>{h.type!=="drone"&&(s.fillStyle="#f33",s.fillRect(h.x*r-1,h.z*r-1,3,3))}),_.enemies.forEach(h=>{if(h.type!=="drone")return;const u=h.x*r,f=h.z*r;s.save(),s.shadowBlur=4,s.shadowColor="#ff4400",s.fillStyle="#ff6600",s.beginPath(),s.moveTo(u,f-4),s.lineTo(u+4,f+4),s.lineTo(u-4,f+4),s.closePath(),s.fill(),s.restore()}),s.fillStyle="#3f3";const o=n.position.x*r,a=n.position.z*r;s.beginPath(),s.arc(o,a,3,0,Math.PI*2),s.fill(),_.captureZones.forEach(h=>{const u=h.x*r,f=h.z*r;s.globalAlpha=h.captured?.8:.4,s.fillStyle=h.captured?"#33ff33":"#ffcc00",s.beginPath(),s.arc(u,f,5,0,Math.PI*2),s.fill(),s.globalAlpha=1,s.fillStyle="#fff",s.font="8px monospace",s.textAlign="center",s.fillText(h.name,u,f+3)});const c=_.enemies.filter(h=>h.type==="drone").length,l=_.enemies.filter(h=>h.type!=="drone").length;s.textAlign="left",c>0?(s.font="bold 10px monospace",s.fillStyle="#ff6600",s.fillText(`⚠ ${c}🛸`,3,10),s.font="bold 10px monospace",s.fillStyle="#ff4444",s.fillText(`${l}👥`,3,22)):(s.font="bold 10px monospace",s.fillStyle="#ff4444",s.fillText(`${l}👥`,3,10))}function $f(i,e,t,n){let s=document.getElementById("waveSummary");s||(s=document.createElement("div"),s.id="waveSummary",s.style.cssText=`
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      z-index:88; background:rgba(0,0,0,0.92); border:2px solid #c41e3a;
      padding:2rem 3rem; text-align:center; font-family:'Courier New',monospace;
      pointer-events:none; display:none;
      box-shadow: 0 0 40px rgba(196,30,58,0.4);
    `,document.body.appendChild(s));const r=n>80?"S":n>60?"A":n>40?"B":n>20?"C":"D",o=r==="S"?"#ffdd00":r==="A"?"#33ff33":r==="B"?"#ffcc00":r==="C"?"#ff8800":"#ff4444";s.innerHTML=`
    <div style="color:#c41e3a;font-size:0.75em;letter-spacing:0.3em;margin-bottom:0.5em;">WAVE ${i} CLEARED</div>
    <div style="color:#fff;font-size:2em;font-weight:900;margin-bottom:1em;letter-spacing:0.1em;">🍁 CANADA HOLDS</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 2rem;text-align:left;margin-bottom:1.5em;">
      <div style="color:#888;font-size:0.8em;">KILLS</div><div style="color:#fff;font-size:1.1em;font-weight:bold;">${e}</div>
      <div style="color:#888;font-size:0.8em;">HEADSHOTS</div><div style="color:#ff4444;font-size:1.1em;font-weight:bold;">${t}</div>
      <div style="color:#888;font-size:0.8em;">ACCURACY</div><div style="color:#ffcc00;font-size:1.1em;font-weight:bold;">${n.toFixed(0)}%</div>
      <div style="color:#888;font-size:0.8em;">GRADE</div><div style="color:${o};font-size:1.4em;font-weight:900;">${r}</div>
    </div>
    <div style="color:#666;font-size:0.75em;letter-spacing:0.2em;">NEXT WAVE IN 5 SECONDS...</div>
  `,s.style.display="block",s.style.opacity="1",setTimeout(()=>{s.style.transition="opacity 0.5s",s.style.opacity="0",setTimeout(()=>{s.style.display="none",s.style.transition=""},500)},4500)}function qf(i){window._lobbyStartGameFn=i;const e=()=>ir(()=>Promise.resolve().then(()=>pS),void 0),t=document.getElementById("hostBtn"),n=document.getElementById("joinBtn"),s=document.getElementById("soloBtn"),r=document.getElementById("startGameBtn"),o=document.getElementById("roomInput"),a=document.getElementById("lobby"),c=document.getElementById("lobby-main"),l=document.getElementById("lobby-hosting"),h=document.getElementById("lobby-connecting"),u=document.getElementById("lobby-error"),f=document.getElementById("roomCodeDisplay");function d(v){u&&(u.style.display="block",u.textContent=v)}function g(){u&&(u.style.display="none",u.textContent="")}t&&t.addEventListener("click",async()=>{g(),t.disabled=!0,t.textContent="CONNECTING TO PEER NETWORK...";try{const v=await e(),m=await new Promise((p,E)=>{const y=v.hostGame();let x=0;const D=setInterval(()=>{x++;const R=document.getElementById("roomCodeDisplay");y?(clearInterval(D),p(y)):x>80&&(clearInterval(D),E(new Error("Timeout")))},100)});f&&(f.textContent=m),c&&(c.style.display="none"),l&&(l.style.display="flex")}catch(v){t.disabled=!1,t.textContent="⚔ HOST GAME",d("FAILED TO CREATE ROOM: "+v.message)}}),n&&n.addEventListener("click",async()=>{g();const v=(o?.value||"").trim().toUpperCase();if(v.length!==6){d("ENTER A 6-CHARACTER ROOM CODE");return}h&&(h.style.display="block"),c&&(c.style.display="none");try{(await e()).joinGame(v)}catch(m){h&&(h.style.display="none"),c&&(c.style.display="flex"),d("FAILED TO JOIN: "+m.message)}}),s&&s.addEventListener("click",()=>{a&&(a.style.display="none"),i()}),r&&r.addEventListener("click",async()=>{a&&(a.style.display="none"),i(),(await e()).notifyGameReady()}),o&&(o.addEventListener("input",()=>{o.value=o.value.toUpperCase()}),o.addEventListener("keydown",v=>{v.key==="Enter"&&n?.click()}))}function Yf(i,e,t,n,s){let r=document.getElementById("endGameScreen");r||(r=document.createElement("div"),r.id="endGameScreen",r.style.cssText=`
      position:fixed; inset:0; z-index:95;
      background:rgba(0,0,0,0.96);
      display:none; flex-direction:column; align-items:center; justify-content:center;
      font-family:'Courier New',monospace; color:#fff;
      border-top: 3px solid #c41e3a;
    `,document.body.appendChild(r));const o=n>80?"S":n>60?"A":n>40?"B":n>20?"C":"D",a={S:"#ffdd00",A:"#33ff33",B:"#ffcc00",C:"#ff8800",D:"#ff4444"}[o],c=i>=10?"🎖 LEGENDARY — THE COMMISSAR DEFEATED":i>=5?"🍁 CANADA HOLDS THE LINE":"⚔ OBJECTIVE SECURED";r.innerHTML=`
    <div style="font-size:0.7em;letter-spacing:0.4em;color:#c41e3a;margin-bottom:0.5em;">AFTER ACTION REPORT</div>
    <div style="font-size:2.8em;font-weight:900;letter-spacing:0.1em;color:#fff;margin-bottom:0.2em;">🍁 CANADA STILL STANDS</div>
    <div style="color:#ffcc00;font-size:0.9em;letter-spacing:0.2em;margin-bottom:2em;">${c}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.7rem 3rem;text-align:left;margin-bottom:2em;min-width:320px;">
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Waves Survived</div>
      <div style="color:#fff;font-size:1.3em;font-weight:bold;">${i}</div>
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Total Kills</div>
      <div style="color:#ff4444;font-size:1.3em;font-weight:bold;">${e}</div>
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Headshots</div>
      <div style="color:#ffaa00;font-size:1.3em;font-weight:bold;">${t}</div>
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Accuracy</div>
      <div style="color:#33ff99;font-size:1.3em;font-weight:bold;">${n.toFixed(0)}%</div>
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Score</div>
      <div style="color:#ffcc00;font-size:1.3em;font-weight:bold;">${s.toLocaleString()}</div>
      <div style="color:#888;font-size:0.8em;text-transform:uppercase;">Combat Grade</div>
      <div style="color:${a};font-size:2em;font-weight:900;">${o}</div>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:2em;">
      <button onclick="location.reload()" style="padding:12px 30px;font-size:1em;font-family:'Courier New',monospace;background:#c41e3a;color:#fff;border:2px solid #ff3333;cursor:pointer;letter-spacing:0.15em;">▶ PLAY AGAIN</button>
      <a href="https://tenet-5.github.io" target="_blank" style="padding:12px 30px;font-size:1em;font-family:'Courier New',monospace;background:#111;color:#ffcc00;border:2px solid #ffaa00;cursor:pointer;letter-spacing:0.1em;text-decoration:none;display:inline-block;">🍁 TENET-5.CA</a>
    </div>
    <div style="color:#444;font-size:0.72em;max-width:500px;text-align:center;line-height:1.6;">
      Red Duster — Canadian political satire FPS.<br>
      <a href="https://tenet-5.github.io" target="_blank" style="color:#666;">tenet-5.github.io</a>
    </div>
  `,r.style.display="flex"}const $r=Object.freeze(Object.defineProperty({__proto__:null,drawMinimap:Xf,initLobby:qf,initMinimap:Wf,playIntroDialogue:zf,randomCombatQuote:xM,showDeathScreen:MM,showEndGameScreen:Yf,showGameUI:Gf,showResupplyBanner:Hf,showWaveBanner:kf,showWaveIntro:Bf,showWaveSummary:$f,triggerCombatQuote:Gl},Symbol.toStringTag,{value:"Module"})),SM=10;let Xi=0,Mu=0,Nn=!1,Su=0,Eu=0;const pt={forward:!1,backward:!1,left:!1,right:!1,sprint:!1,crouch:!1,leanLeft:!1,leanRight:!1};new P;const Ei=new P;let Gt=null,Ot=null,oi=null,el=null;function EM(i,e,t,n,s){Gt=i,Ot=t,oi=n,el=s,_.enemies,window.addEventListener("keydown",TM),window.addEventListener("keyup",bM),window.addEventListener("mousemove",r=>{if(!_.started||_.paused)return;const o=.002;_.mouse.x+=r.movementX*o,_.mouse.y+=r.movementY*o,_.mouse.y=Math.max(-Math.PI/2,Math.min(Math.PI/2,_.mouse.y)),i.rotation.y=-_.mouse.x,e.rotation.x=-_.mouse.y})}function TM(i){if(_.keys[i.key.toLowerCase()]=!0,!(!_.started||_.paused||!_.alive))switch(i.code){case"KeyW":case"ArrowUp":pt.forward=!0;break;case"KeyS":case"ArrowDown":pt.backward=!0;break;case"KeyA":case"ArrowLeft":pt.left=!0;break;case"KeyD":case"ArrowRight":pt.right=!0;break;case"ShiftLeft":case"ShiftRight":pt.sprint=!0;break;case"ControlLeft":case"KeyC":pt.crouch=!0,_.crouching=!0;break;case"KeyQ":pt.leanLeft=!0;break;case"KeyE":pt.leanRight=!0;break;case"Space":i.preventDefault();break;case"KeyF":RM();break}}function bM(i){switch(_.keys[i.key.toLowerCase()]=!1,i.code){case"KeyW":case"ArrowUp":pt.forward=!1;break;case"KeyS":case"ArrowDown":pt.backward=!1;break;case"KeyA":case"ArrowLeft":pt.left=!1;break;case"KeyD":case"ArrowRight":pt.right=!1;break;case"ShiftLeft":case"ShiftRight":pt.sprint=!1;break;case"ControlLeft":case"KeyC":pt.crouch=!1,_.crouching=!1;break;case"KeyQ":pt.leanLeft=!1;break;case"KeyE":pt.leanRight=!1;break}}function ks(){const i=new P(0,0,-1);return i.applyQuaternion(Gt.quaternion),i.y=0,i.normalize(),i}function wM(i){if(!_.started||_.paused||!_.alive||!Gt)return;const e=pt.forward||pt.backward||pt.left||pt.right;Nn=pt.sprint&&e,_.isSprinting=Nn;const t=Nn?_.speed*_.sprintMult:_.crouching?_.speed*.5:_.speed;Ei.set(0,0,0),pt.forward&&(Ei.z-=1),pt.backward&&(Ei.z+=1),pt.left&&(Ei.x-=1),pt.right&&(Ei.x+=1),Ei.length()>0&&Ei.normalize();const n=Ei.clone().applyQuaternion(Gt.quaternion);n.y=0,n.length()>0&&n.normalize();const s=n.x*t*i,r=n.z*t*i;if(Xt(Gt.position.x+s,Gt.position.z,.35)||(Gt.position.x+=s),Xt(Gt.position.x,Gt.position.z+r,.35)||(Gt.position.z+=r),_.velY-=_.gravity*i,Gt.position.y+=_.velY*i,Gt.position.y<=_.playerHeight&&(Gt.position.y=_.playerHeight,_.velY=0,_.jumping=!1),Nn?(_.sprint=Math.max(0,_.sprint-i*15),_.sprint===0&&(pt.sprint=!1)):_.sprint=Math.min(_.maxSprint,_.sprint+i*8),e){const a=Nn?14:7,c=Nn?1.2:.45,l=Nn?.6:.18;Xi+=i*a,Eu=Math.sin(Xi)*c*.05,Su=Math.sin(Xi*.5)*l*.02,Ot.position.y=ut.lerp(Ot.position.y,Eu,.3),Ot.position.x=ut.lerp(Ot.position.x,Su,.3);const h=Nn?260:450,u=performance.now();u-Mu>h&&(Et("footstep"),Mu=u),Nn?(Ot.rotation.x=ut.lerp(Ot.rotation.x,-.08,.12),Ot.rotation.z=ut.lerp(Ot.rotation.z,Math.sin(Xi*.5)*.03,.15),oi&&(oi.uniforms.amount.value=.95+Math.abs(Math.sin(Xi))*.08)):(Ot.rotation.z=ut.lerp(Ot.rotation.z,Tu(),.1),oi&&(oi.uniforms.amount.value=ut.lerp(oi.uniforms.amount.value,.9,.08)))}else Xi*=.85,Ot.position.y=ut.lerp(Ot.position.y,0,.15),Ot.position.x=ut.lerp(Ot.position.x,0,.15),Ot.rotation.x=ut.lerp(Ot.rotation.x,0,.08),Ot.rotation.z=ut.lerp(Ot.rotation.z,Tu(),.1),oi&&(oi.uniforms.amount.value=ut.lerp(oi.uniforms.amount.value,.9,.08));const o=Math.sqrt((n.x*t)**2+(n.z*t)**2);if(Nn&&o>SM){const a=ks();let c=!1;for(let l=_.enemies.length-1;l>=0;l--){const h=_.enemies[l];if(h.dead||h.type==="drone")continue;const u=h.x-Gt.position.x,f=h.z-Gt.position.z;if(Math.sqrt(u*u+f*f)>3.5)continue;const g=new P(u,0,f).normalize();if(a.dot(g)<.5)continue;c=!0,(!c||Math.random()<.3)&&Gl("BODY CHECK! CANADA'S STILL STANDING!","#ff6600"),Et("headshot");const m=a.clone();m.y=.6,m.multiplyScalar(35);const p=new P(h.x,1.5,h.z);for(let E=0;E<15;E++){const y=.4+Math.random()*1.2,x=new H(new Fe(y,y,y),new ue({color:E<8?11141120:6684672,roughness:.9}));x.position.copy(p),x.position.x+=(Math.random()-.5)*1.5,x.position.z+=(Math.random()-.5)*1.5,x.userData={vel:new P(m.x*(.5+Math.random())+(Math.random()-.5)*20,m.y*(.8+Math.random()),m.z*(.5+Math.random())+(Math.random()-.5)*20),life:4+Math.random()*3,spin:new P((Math.random()-.5)*12,(Math.random()-.5)*12,(Math.random()-.5)*12),isGib:!0},el.add(x),_.particles.push({mesh:x,x:x.position.x,y:x.position.y,z:x.position.z,vx:x.userData.vel.x,vy:x.userData.vel.y,vz:x.userData.vel.z,life:x.userData.life,isGib:!0,spin:x.userData.spin})}_.screenShake=.6,_.shakeIntensity=.2,h.dead=!0,el.remove(h.mesh),_.enemies.splice(l,1),_.kills++,_.score+=50}}}function Tu(){return pt.leanLeft?.25:pt.leanRight?-.25:0}function CM(){return Xi}function AM(){return Nn}let bu=0;function RM(){if(!_.alive||_.paused||!Gt)return;const i=performance.now();if(i-bu<400)return;bu=i;const e=Gt.position.x,t=Gt.position.z,n=ks(),s=2.2,r=28,o=8;let a=null,c=1/0;for(const u of _.physicsBarrels){if(u.hasExploded)continue;const f=Math.hypot(e-u.x,t-u.z);if(f>s)continue;const d=new P(u.x-e,0,u.z-t).normalize();n.dot(d)<.3||f<c&&(c=f,a=u)}if(a){const u=a,f=new P(u.x-e,0,u.z-t).normalize();u.vx=f.x*r+(Math.random()-.5)*4,u.vz=f.z*r+(Math.random()-.5)*4,u.vy=o,u.grounded=!1,u.spinning=!0,u._rx=(Math.random()-.5)*15,u._rz=(Math.random()-.5)*15,Et("shoot"),st("💥 BARREL KICKED!"),_.screenShake=.08,_.shakeIntensity=.04;return}let l=null,h=1/0;for(const u of _.corpses){if(!u.mesh)continue;const f=u.mesh.position.x,d=u.mesh.position.z,g=Math.hypot(e-f,t-d);if(g>s)continue;const v=new P(f-e,0,d-t).normalize();n.dot(v)<.2||g<h&&(h=g,l=u)}if(l){const u=l;u.vx=n.x*r*1.4+(Math.random()-.5)*5,u.vz=n.z*r*1.4+(Math.random()-.5)*5,u.vy=o*1.2,u.rx=(Math.random()-.5)*20,u.ry=(Math.random()-.5)*20,u.rz=(Math.random()-.5)*20,u.deathTime=Math.max(u.deathTime,4),Et("hit");const f=["HOCKEY STYLE CORPSE PUNT!","GET OFF MY LAWN!","COMMIE FIELD GOAL!","THAT'S A FIVE-MINUTE MAJOR!"];st(f[Math.floor(Math.random()*f.length)]),_.screenShake=.06,_.shakeIntensity=.04;return}st("NOTHING TO KICK")}class PM{constructor(){this.encoder=new TextEncoder,this._pieces=[],this._parts=[]}append_buffer(e){this.flush(),this._parts.push(e)}append(e){this._pieces.push(e)}flush(){if(this._pieces.length>0){const e=new Uint8Array(this._pieces);this._parts.push(e),this._pieces=[]}}toArrayBuffer(){const e=[];for(const t of this._parts)e.push(t);return DM(e).buffer}}function DM(i){let e=0;for(const s of i)e+=s.byteLength;const t=new Uint8Array(e);let n=0;for(const s of i){const r=new Uint8Array(s.buffer,s.byteOffset,s.byteLength);t.set(r,n),n+=s.byteLength}return t}function jf(i){return new IM(i).unpack()}function Kf(i){const e=new LM,t=e.pack(i);return t instanceof Promise?t.then(()=>e.getBuffer()):e.getBuffer()}class IM{constructor(e){this.index=0,this.dataBuffer=e,this.dataView=new Uint8Array(this.dataBuffer),this.length=this.dataBuffer.byteLength}unpack(){const e=this.unpack_uint8();if(e<128)return e;if((e^224)<32)return(e^224)-32;let t;if((t=e^160)<=15)return this.unpack_raw(t);if((t=e^176)<=15)return this.unpack_string(t);if((t=e^144)<=15)return this.unpack_array(t);if((t=e^128)<=15)return this.unpack_map(t);switch(e){case 192:return null;case 193:return;case 194:return!1;case 195:return!0;case 202:return this.unpack_float();case 203:return this.unpack_double();case 204:return this.unpack_uint8();case 205:return this.unpack_uint16();case 206:return this.unpack_uint32();case 207:return this.unpack_uint64();case 208:return this.unpack_int8();case 209:return this.unpack_int16();case 210:return this.unpack_int32();case 211:return this.unpack_int64();case 212:return;case 213:return;case 214:return;case 215:return;case 216:return t=this.unpack_uint16(),this.unpack_string(t);case 217:return t=this.unpack_uint32(),this.unpack_string(t);case 218:return t=this.unpack_uint16(),this.unpack_raw(t);case 219:return t=this.unpack_uint32(),this.unpack_raw(t);case 220:return t=this.unpack_uint16(),this.unpack_array(t);case 221:return t=this.unpack_uint32(),this.unpack_array(t);case 222:return t=this.unpack_uint16(),this.unpack_map(t);case 223:return t=this.unpack_uint32(),this.unpack_map(t)}}unpack_uint8(){const e=this.dataView[this.index]&255;return this.index++,e}unpack_uint16(){const e=this.read(2),t=(e[0]&255)*256+(e[1]&255);return this.index+=2,t}unpack_uint32(){const e=this.read(4),t=((e[0]*256+e[1])*256+e[2])*256+e[3];return this.index+=4,t}unpack_uint64(){const e=this.read(8),t=((((((e[0]*256+e[1])*256+e[2])*256+e[3])*256+e[4])*256+e[5])*256+e[6])*256+e[7];return this.index+=8,t}unpack_int8(){const e=this.unpack_uint8();return e<128?e:e-256}unpack_int16(){const e=this.unpack_uint16();return e<32768?e:e-65536}unpack_int32(){const e=this.unpack_uint32();return e<2**31?e:e-2**32}unpack_int64(){const e=this.unpack_uint64();return e<2**63?e:e-2**64}unpack_raw(e){if(this.length<this.index+e)throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${e} ${this.length}`);const t=this.dataBuffer.slice(this.index,this.index+e);return this.index+=e,t}unpack_string(e){const t=this.read(e);let n=0,s="",r,o;for(;n<e;)r=t[n],r<160?(o=r,n++):(r^192)<32?(o=(r&31)<<6|t[n+1]&63,n+=2):(r^224)<16?(o=(r&15)<<12|(t[n+1]&63)<<6|t[n+2]&63,n+=3):(o=(r&7)<<18|(t[n+1]&63)<<12|(t[n+2]&63)<<6|t[n+3]&63,n+=4),s+=String.fromCodePoint(o);return this.index+=e,s}unpack_array(e){const t=new Array(e);for(let n=0;n<e;n++)t[n]=this.unpack();return t}unpack_map(e){const t={};for(let n=0;n<e;n++){const s=this.unpack();t[s]=this.unpack()}return t}unpack_float(){const e=this.unpack_uint32(),t=e>>31,n=(e>>23&255)-127,s=e&8388607|8388608;return(t===0?1:-1)*s*2**(n-23)}unpack_double(){const e=this.unpack_uint32(),t=this.unpack_uint32(),n=e>>31,s=(e>>20&2047)-1023,o=(e&1048575|1048576)*2**(s-20)+t*2**(s-52);return(n===0?1:-1)*o}read(e){const t=this.index;if(t+e<=this.length)return this.dataView.subarray(t,t+e);throw new Error("BinaryPackFailure: read index out of range")}}class LM{getBuffer(){return this._bufferBuilder.toArrayBuffer()}pack(e){if(typeof e=="string")this.pack_string(e);else if(typeof e=="number")Math.floor(e)===e?this.pack_integer(e):this.pack_double(e);else if(typeof e=="boolean")e===!0?this._bufferBuilder.append(195):e===!1&&this._bufferBuilder.append(194);else if(e===void 0)this._bufferBuilder.append(192);else if(typeof e=="object")if(e===null)this._bufferBuilder.append(192);else{const t=e.constructor;if(e instanceof Array){const n=this.pack_array(e);if(n instanceof Promise)return n.then(()=>this._bufferBuilder.flush())}else if(e instanceof ArrayBuffer)this.pack_bin(new Uint8Array(e));else if("BYTES_PER_ELEMENT"in e){const n=e;this.pack_bin(new Uint8Array(n.buffer,n.byteOffset,n.byteLength))}else if(e instanceof Date)this.pack_string(e.toString());else{if(e instanceof Blob)return e.arrayBuffer().then(n=>{this.pack_bin(new Uint8Array(n)),this._bufferBuilder.flush()});if(t==Object||t.toString().startsWith("class")){const n=this.pack_object(e);if(n instanceof Promise)return n.then(()=>this._bufferBuilder.flush())}else throw new Error(`Type "${t.toString()}" not yet supported`)}}else throw new Error(`Type "${typeof e}" not yet supported`);this._bufferBuilder.flush()}pack_bin(e){const t=e.length;if(t<=15)this.pack_uint8(160+t);else if(t<=65535)this._bufferBuilder.append(218),this.pack_uint16(t);else if(t<=4294967295)this._bufferBuilder.append(219),this.pack_uint32(t);else throw new Error("Invalid length");this._bufferBuilder.append_buffer(e)}pack_string(e){const t=this._textEncoder.encode(e),n=t.length;if(n<=15)this.pack_uint8(176+n);else if(n<=65535)this._bufferBuilder.append(216),this.pack_uint16(n);else if(n<=4294967295)this._bufferBuilder.append(217),this.pack_uint32(n);else throw new Error("Invalid length");this._bufferBuilder.append_buffer(t)}pack_array(e){const t=e.length;if(t<=15)this.pack_uint8(144+t);else if(t<=65535)this._bufferBuilder.append(220),this.pack_uint16(t);else if(t<=4294967295)this._bufferBuilder.append(221),this.pack_uint32(t);else throw new Error("Invalid length");const n=s=>{if(s<t){const r=this.pack(e[s]);return r instanceof Promise?r.then(()=>n(s+1)):n(s+1)}};return n(0)}pack_integer(e){if(e>=-32&&e<=127)this._bufferBuilder.append(e&255);else if(e>=0&&e<=255)this._bufferBuilder.append(204),this.pack_uint8(e);else if(e>=-128&&e<=127)this._bufferBuilder.append(208),this.pack_int8(e);else if(e>=0&&e<=65535)this._bufferBuilder.append(205),this.pack_uint16(e);else if(e>=-32768&&e<=32767)this._bufferBuilder.append(209),this.pack_int16(e);else if(e>=0&&e<=4294967295)this._bufferBuilder.append(206),this.pack_uint32(e);else if(e>=-2147483648&&e<=2147483647)this._bufferBuilder.append(210),this.pack_int32(e);else if(e>=-9223372036854776e3&&e<=9223372036854776e3)this._bufferBuilder.append(211),this.pack_int64(e);else if(e>=0&&e<=18446744073709552e3)this._bufferBuilder.append(207),this.pack_uint64(e);else throw new Error("Invalid integer")}pack_double(e){let t=0;e<0&&(t=1,e=-e);const n=Math.floor(Math.log(e)/Math.LN2),s=e/2**n-1,r=Math.floor(s*2**52),o=2**32,a=t<<31|n+1023<<20|r/o&1048575,c=r%o;this._bufferBuilder.append(203),this.pack_int32(a),this.pack_int32(c)}pack_object(e){const t=Object.keys(e),n=t.length;if(n<=15)this.pack_uint8(128+n);else if(n<=65535)this._bufferBuilder.append(222),this.pack_uint16(n);else if(n<=4294967295)this._bufferBuilder.append(223),this.pack_uint32(n);else throw new Error("Invalid length");const s=r=>{if(r<t.length){const o=t[r];if(e.hasOwnProperty(o)){this.pack(o);const a=this.pack(e[o]);if(a instanceof Promise)return a.then(()=>s(r+1))}return s(r+1)}};return s(0)}pack_uint8(e){this._bufferBuilder.append(e)}pack_uint16(e){this._bufferBuilder.append(e>>8),this._bufferBuilder.append(e&255)}pack_uint32(e){const t=e&4294967295;this._bufferBuilder.append((t&4278190080)>>>24),this._bufferBuilder.append((t&16711680)>>>16),this._bufferBuilder.append((t&65280)>>>8),this._bufferBuilder.append(t&255)}pack_uint64(e){const t=e/4294967296,n=e%2**32;this._bufferBuilder.append((t&4278190080)>>>24),this._bufferBuilder.append((t&16711680)>>>16),this._bufferBuilder.append((t&65280)>>>8),this._bufferBuilder.append(t&255),this._bufferBuilder.append((n&4278190080)>>>24),this._bufferBuilder.append((n&16711680)>>>16),this._bufferBuilder.append((n&65280)>>>8),this._bufferBuilder.append(n&255)}pack_int8(e){this._bufferBuilder.append(e&255)}pack_int16(e){this._bufferBuilder.append((e&65280)>>8),this._bufferBuilder.append(e&255)}pack_int32(e){this._bufferBuilder.append(e>>>24&255),this._bufferBuilder.append((e&16711680)>>>16),this._bufferBuilder.append((e&65280)>>>8),this._bufferBuilder.append(e&255)}pack_int64(e){const t=Math.floor(e/4294967296),n=e%2**32;this._bufferBuilder.append((t&4278190080)>>>24),this._bufferBuilder.append((t&16711680)>>>16),this._bufferBuilder.append((t&65280)>>>8),this._bufferBuilder.append(t&255),this._bufferBuilder.append((n&4278190080)>>>24),this._bufferBuilder.append((n&16711680)>>>16),this._bufferBuilder.append((n&65280)>>>8),this._bufferBuilder.append(n&255)}constructor(){this._bufferBuilder=new PM,this._textEncoder=new TextEncoder}}let Zf=!0,Jf=!0;function Sr(i,e,t){const n=i.match(e);return n&&n.length>=t&&parseFloat(n[t],10)}function rs(i,e,t){if(!i.RTCPeerConnection)return;const n=i.RTCPeerConnection.prototype,s=n.addEventListener;n.addEventListener=function(o,a){if(o!==e)return s.apply(this,arguments);const c=l=>{const h=t(l);h&&(a.handleEvent?a.handleEvent(h):a(h))};return this._eventMap=this._eventMap||{},this._eventMap[e]||(this._eventMap[e]=new Map),this._eventMap[e].set(a,c),s.apply(this,[o,c])};const r=n.removeEventListener;n.removeEventListener=function(o,a){if(o!==e||!this._eventMap||!this._eventMap[e])return r.apply(this,arguments);if(!this._eventMap[e].has(a))return r.apply(this,arguments);const c=this._eventMap[e].get(a);return this._eventMap[e].delete(a),this._eventMap[e].size===0&&delete this._eventMap[e],Object.keys(this._eventMap).length===0&&delete this._eventMap,r.apply(this,[o,c])},Object.defineProperty(n,"on"+e,{get(){return this["_on"+e]},set(o){this["_on"+e]&&(this.removeEventListener(e,this["_on"+e]),delete this["_on"+e]),o&&this.addEventListener(e,this["_on"+e]=o)},enumerable:!0,configurable:!0})}function UM(i){return typeof i!="boolean"?new Error("Argument type: "+typeof i+". Please use a boolean."):(Zf=i,i?"adapter.js logging disabled":"adapter.js logging enabled")}function NM(i){return typeof i!="boolean"?new Error("Argument type: "+typeof i+". Please use a boolean."):(Jf=!i,"adapter.js deprecation warnings "+(i?"disabled":"enabled"))}function Qf(){if(typeof window=="object"){if(Zf)return;typeof console<"u"&&typeof console.log=="function"&&console.log.apply(console,arguments)}}function Vl(i,e){Jf&&console.warn(i+" is deprecated, please use "+e+" instead.")}function OM(i){const e={browser:null,version:null};if(typeof i>"u"||!i.navigator||!i.navigator.userAgent)return e.browser="Not a browser.",e;const{navigator:t}=i;if(t.userAgentData&&t.userAgentData.brands){const n=t.userAgentData.brands.find(s=>s.brand==="Chromium");if(n)return{browser:"chrome",version:parseInt(n.version,10)}}if(t.mozGetUserMedia)e.browser="firefox",e.version=parseInt(Sr(t.userAgent,/Firefox\/(\d+)\./,1));else if(t.webkitGetUserMedia||i.isSecureContext===!1&&i.webkitRTCPeerConnection)e.browser="chrome",e.version=parseInt(Sr(t.userAgent,/Chrom(e|ium)\/(\d+)\./,2))||null;else if(i.RTCPeerConnection&&t.userAgent.match(/AppleWebKit\/(\d+)\./))e.browser="safari",e.version=parseInt(Sr(t.userAgent,/AppleWebKit\/(\d+)\./,1)),e.supportsUnifiedPlan=i.RTCRtpTransceiver&&"currentDirection"in i.RTCRtpTransceiver.prototype,e._safariVersion=Sr(t.userAgent,/Version\/(\d+(\.?\d+))/,1);else return e.browser="Not a supported browser.",e;return e}function wu(i){return Object.prototype.toString.call(i)==="[object Object]"}function ed(i){return wu(i)?Object.keys(i).reduce(function(e,t){const n=wu(i[t]),s=n?ed(i[t]):i[t],r=n&&!Object.keys(s).length;return s===void 0||r?e:Object.assign(e,{[t]:s})},{}):i}function tl(i,e,t){!e||t.has(e.id)||(t.set(e.id,e),Object.keys(e).forEach(n=>{n.endsWith("Id")?tl(i,i.get(e[n]),t):n.endsWith("Ids")&&e[n].forEach(s=>{tl(i,i.get(s),t)})}))}function Cu(i,e,t){const n=t?"outbound-rtp":"inbound-rtp",s=new Map;if(e===null)return s;const r=[];return i.forEach(o=>{o.type==="track"&&o.trackIdentifier===e.id&&r.push(o)}),r.forEach(o=>{i.forEach(a=>{a.type===n&&a.trackId===o.id&&tl(i,a,s)})}),s}const Au=Qf;function td(i,e){const t=i&&i.navigator;if(!t.mediaDevices)return;const n=function(a){if(typeof a!="object"||a.mandatory||a.optional)return a;const c={};return Object.keys(a).forEach(l=>{if(l==="require"||l==="advanced"||l==="mediaSource")return;const h=typeof a[l]=="object"?a[l]:{ideal:a[l]};h.exact!==void 0&&typeof h.exact=="number"&&(h.min=h.max=h.exact);const u=function(f,d){return f?f+d.charAt(0).toUpperCase()+d.slice(1):d==="deviceId"?"sourceId":d};if(h.ideal!==void 0){c.optional=c.optional||[];let f={};typeof h.ideal=="number"?(f[u("min",l)]=h.ideal,c.optional.push(f),f={},f[u("max",l)]=h.ideal,c.optional.push(f)):(f[u("",l)]=h.ideal,c.optional.push(f))}h.exact!==void 0&&typeof h.exact!="number"?(c.mandatory=c.mandatory||{},c.mandatory[u("",l)]=h.exact):["min","max"].forEach(f=>{h[f]!==void 0&&(c.mandatory=c.mandatory||{},c.mandatory[u(f,l)]=h[f])})}),a.advanced&&(c.optional=(c.optional||[]).concat(a.advanced)),c},s=function(a,c){if(e.version>=61)return c(a);if(a=JSON.parse(JSON.stringify(a)),a&&typeof a.audio=="object"){const l=function(h,u,f){u in h&&!(f in h)&&(h[f]=h[u],delete h[u])};a=JSON.parse(JSON.stringify(a)),l(a.audio,"autoGainControl","googAutoGainControl"),l(a.audio,"noiseSuppression","googNoiseSuppression"),a.audio=n(a.audio)}if(a&&typeof a.video=="object"){let l=a.video.facingMode;l=l&&(typeof l=="object"?l:{ideal:l});const h=e.version<66;if(l&&(l.exact==="user"||l.exact==="environment"||l.ideal==="user"||l.ideal==="environment")&&!(t.mediaDevices.getSupportedConstraints&&t.mediaDevices.getSupportedConstraints().facingMode&&!h)){delete a.video.facingMode;let u;if(l.exact==="environment"||l.ideal==="environment"?u=["back","rear"]:(l.exact==="user"||l.ideal==="user")&&(u=["front"]),u)return t.mediaDevices.enumerateDevices().then(f=>{f=f.filter(g=>g.kind==="videoinput");let d=f.find(g=>u.some(v=>g.label.toLowerCase().includes(v)));return!d&&f.length&&u.includes("back")&&(d=f[f.length-1]),d&&(a.video.deviceId=l.exact?{exact:d.deviceId}:{ideal:d.deviceId}),a.video=n(a.video),Au("chrome: "+JSON.stringify(a)),c(a)})}a.video=n(a.video)}return Au("chrome: "+JSON.stringify(a)),c(a)},r=function(a){return e.version>=64?a:{name:{PermissionDeniedError:"NotAllowedError",PermissionDismissedError:"NotAllowedError",InvalidStateError:"NotAllowedError",DevicesNotFoundError:"NotFoundError",ConstraintNotSatisfiedError:"OverconstrainedError",TrackStartError:"NotReadableError",MediaDeviceFailedDueToShutdown:"NotAllowedError",MediaDeviceKillSwitchOn:"NotAllowedError",TabCaptureError:"AbortError",ScreenCaptureError:"AbortError",DeviceCaptureError:"AbortError"}[a.name]||a.name,message:a.message,constraint:a.constraint||a.constraintName,toString(){return this.name+(this.message&&": ")+this.message}}},o=function(a,c,l){s(a,h=>{t.webkitGetUserMedia(h,c,u=>{l&&l(r(u))})})};if(t.getUserMedia=o.bind(t),t.mediaDevices.getUserMedia){const a=t.mediaDevices.getUserMedia.bind(t.mediaDevices);t.mediaDevices.getUserMedia=function(c){return s(c,l=>a(l).then(h=>{if(l.audio&&!h.getAudioTracks().length||l.video&&!h.getVideoTracks().length)throw h.getTracks().forEach(u=>{u.stop()}),new DOMException("","NotFoundError");return h},h=>Promise.reject(r(h))))}}}function nd(i){i.MediaStream=i.MediaStream||i.webkitMediaStream}function id(i){if(typeof i=="object"&&i.RTCPeerConnection&&!("ontrack"in i.RTCPeerConnection.prototype)){Object.defineProperty(i.RTCPeerConnection.prototype,"ontrack",{get(){return this._ontrack},set(t){this._ontrack&&this.removeEventListener("track",this._ontrack),this.addEventListener("track",this._ontrack=t)},enumerable:!0,configurable:!0});const e=i.RTCPeerConnection.prototype.setRemoteDescription;i.RTCPeerConnection.prototype.setRemoteDescription=function(){return this._ontrackpoly||(this._ontrackpoly=n=>{n.stream.addEventListener("addtrack",s=>{let r;i.RTCPeerConnection.prototype.getReceivers?r=this.getReceivers().find(a=>a.track&&a.track.id===s.track.id):r={track:s.track};const o=new Event("track");o.track=s.track,o.receiver=r,o.transceiver={receiver:r},o.streams=[n.stream],this.dispatchEvent(o)}),n.stream.getTracks().forEach(s=>{let r;i.RTCPeerConnection.prototype.getReceivers?r=this.getReceivers().find(a=>a.track&&a.track.id===s.id):r={track:s};const o=new Event("track");o.track=s,o.receiver=r,o.transceiver={receiver:r},o.streams=[n.stream],this.dispatchEvent(o)})},this.addEventListener("addstream",this._ontrackpoly)),e.apply(this,arguments)}}else rs(i,"track",e=>(e.transceiver||Object.defineProperty(e,"transceiver",{value:{receiver:e.receiver}}),e))}function sd(i){if(typeof i=="object"&&i.RTCPeerConnection&&!("getSenders"in i.RTCPeerConnection.prototype)&&"createDTMFSender"in i.RTCPeerConnection.prototype){const e=function(s,r){return{track:r,get dtmf(){return this._dtmf===void 0&&(r.kind==="audio"?this._dtmf=s.createDTMFSender(r):this._dtmf=null),this._dtmf},_pc:s}};if(!i.RTCPeerConnection.prototype.getSenders){i.RTCPeerConnection.prototype.getSenders=function(){return this._senders=this._senders||[],this._senders.slice()};const s=i.RTCPeerConnection.prototype.addTrack;i.RTCPeerConnection.prototype.addTrack=function(a,c){let l=s.apply(this,arguments);return l||(l=e(this,a),this._senders.push(l)),l};const r=i.RTCPeerConnection.prototype.removeTrack;i.RTCPeerConnection.prototype.removeTrack=function(a){r.apply(this,arguments);const c=this._senders.indexOf(a);c!==-1&&this._senders.splice(c,1)}}const t=i.RTCPeerConnection.prototype.addStream;i.RTCPeerConnection.prototype.addStream=function(r){this._senders=this._senders||[],t.apply(this,[r]),r.getTracks().forEach(o=>{this._senders.push(e(this,o))})};const n=i.RTCPeerConnection.prototype.removeStream;i.RTCPeerConnection.prototype.removeStream=function(r){this._senders=this._senders||[],n.apply(this,[r]),r.getTracks().forEach(o=>{const a=this._senders.find(c=>c.track===o);a&&this._senders.splice(this._senders.indexOf(a),1)})}}else if(typeof i=="object"&&i.RTCPeerConnection&&"getSenders"in i.RTCPeerConnection.prototype&&"createDTMFSender"in i.RTCPeerConnection.prototype&&i.RTCRtpSender&&!("dtmf"in i.RTCRtpSender.prototype)){const e=i.RTCPeerConnection.prototype.getSenders;i.RTCPeerConnection.prototype.getSenders=function(){const n=e.apply(this,[]);return n.forEach(s=>s._pc=this),n},Object.defineProperty(i.RTCRtpSender.prototype,"dtmf",{get(){return this._dtmf===void 0&&(this.track.kind==="audio"?this._dtmf=this._pc.createDTMFSender(this.track):this._dtmf=null),this._dtmf}})}}function rd(i){if(!(typeof i=="object"&&i.RTCPeerConnection&&i.RTCRtpSender&&i.RTCRtpReceiver))return;if(!("getStats"in i.RTCRtpSender.prototype)){const t=i.RTCPeerConnection.prototype.getSenders;t&&(i.RTCPeerConnection.prototype.getSenders=function(){const r=t.apply(this,[]);return r.forEach(o=>o._pc=this),r});const n=i.RTCPeerConnection.prototype.addTrack;n&&(i.RTCPeerConnection.prototype.addTrack=function(){const r=n.apply(this,arguments);return r._pc=this,r}),i.RTCRtpSender.prototype.getStats=function(){const r=this;return this._pc.getStats().then(o=>Cu(o,r.track,!0))}}if(!("getStats"in i.RTCRtpReceiver.prototype)){const t=i.RTCPeerConnection.prototype.getReceivers;t&&(i.RTCPeerConnection.prototype.getReceivers=function(){const s=t.apply(this,[]);return s.forEach(r=>r._pc=this),s}),rs(i,"track",n=>(n.receiver._pc=n.srcElement,n)),i.RTCRtpReceiver.prototype.getStats=function(){const s=this;return this._pc.getStats().then(r=>Cu(r,s.track,!1))}}if(!("getStats"in i.RTCRtpSender.prototype&&"getStats"in i.RTCRtpReceiver.prototype))return;const e=i.RTCPeerConnection.prototype.getStats;i.RTCPeerConnection.prototype.getStats=function(){if(arguments.length>0&&arguments[0]instanceof i.MediaStreamTrack){const n=arguments[0];let s,r,o;return this.getSenders().forEach(a=>{a.track===n&&(s?o=!0:s=a)}),this.getReceivers().forEach(a=>(a.track===n&&(r?o=!0:r=a),a.track===n)),o||s&&r?Promise.reject(new DOMException("There are more than one sender or receiver for the track.","InvalidAccessError")):s?s.getStats():r?r.getStats():Promise.reject(new DOMException("There is no sender or receiver for the track.","InvalidAccessError"))}return e.apply(this,arguments)}}function od(i){i.RTCPeerConnection.prototype.getLocalStreams=function(){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},Object.keys(this._shimmedLocalStreams).map(o=>this._shimmedLocalStreams[o][0])};const e=i.RTCPeerConnection.prototype.addTrack;i.RTCPeerConnection.prototype.addTrack=function(o,a){if(!a)return e.apply(this,arguments);this._shimmedLocalStreams=this._shimmedLocalStreams||{};const c=e.apply(this,arguments);return this._shimmedLocalStreams[a.id]?this._shimmedLocalStreams[a.id].indexOf(c)===-1&&this._shimmedLocalStreams[a.id].push(c):this._shimmedLocalStreams[a.id]=[a,c],c};const t=i.RTCPeerConnection.prototype.addStream;i.RTCPeerConnection.prototype.addStream=function(o){this._shimmedLocalStreams=this._shimmedLocalStreams||{},o.getTracks().forEach(l=>{if(this.getSenders().find(u=>u.track===l))throw new DOMException("Track already exists.","InvalidAccessError")});const a=this.getSenders();t.apply(this,arguments);const c=this.getSenders().filter(l=>a.indexOf(l)===-1);this._shimmedLocalStreams[o.id]=[o].concat(c)};const n=i.RTCPeerConnection.prototype.removeStream;i.RTCPeerConnection.prototype.removeStream=function(o){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},delete this._shimmedLocalStreams[o.id],n.apply(this,arguments)};const s=i.RTCPeerConnection.prototype.removeTrack;i.RTCPeerConnection.prototype.removeTrack=function(o){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},o&&Object.keys(this._shimmedLocalStreams).forEach(a=>{const c=this._shimmedLocalStreams[a].indexOf(o);c!==-1&&this._shimmedLocalStreams[a].splice(c,1),this._shimmedLocalStreams[a].length===1&&delete this._shimmedLocalStreams[a]}),s.apply(this,arguments)}}function ad(i,e){if(!i.RTCPeerConnection)return;if(i.RTCPeerConnection.prototype.addTrack&&e.version>=65)return od(i);const t=i.RTCPeerConnection.prototype.getLocalStreams;i.RTCPeerConnection.prototype.getLocalStreams=function(){const h=t.apply(this);return this._reverseStreams=this._reverseStreams||{},h.map(u=>this._reverseStreams[u.id])};const n=i.RTCPeerConnection.prototype.addStream;i.RTCPeerConnection.prototype.addStream=function(h){if(this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},h.getTracks().forEach(u=>{if(this.getSenders().find(d=>d.track===u))throw new DOMException("Track already exists.","InvalidAccessError")}),!this._reverseStreams[h.id]){const u=new i.MediaStream(h.getTracks());this._streams[h.id]=u,this._reverseStreams[u.id]=h,h=u}n.apply(this,[h])};const s=i.RTCPeerConnection.prototype.removeStream;i.RTCPeerConnection.prototype.removeStream=function(h){this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},s.apply(this,[this._streams[h.id]||h]),delete this._reverseStreams[this._streams[h.id]?this._streams[h.id].id:h.id],delete this._streams[h.id]},i.RTCPeerConnection.prototype.addTrack=function(h,u){if(this.signalingState==="closed")throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");const f=[].slice.call(arguments,1);if(f.length!==1||!f[0].getTracks().find(v=>v===h))throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.","NotSupportedError");if(this.getSenders().find(v=>v.track===h))throw new DOMException("Track already exists.","InvalidAccessError");this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{};const g=this._streams[u.id];if(g)g.addTrack(h),Promise.resolve().then(()=>{this.dispatchEvent(new Event("negotiationneeded"))});else{const v=new i.MediaStream([h]);this._streams[u.id]=v,this._reverseStreams[v.id]=u,this.addStream(v)}return this.getSenders().find(v=>v.track===h)};function r(l,h){let u=h.sdp;return Object.keys(l._reverseStreams||[]).forEach(f=>{const d=l._reverseStreams[f],g=l._streams[d.id];u=u.replace(new RegExp(g.id,"g"),d.id)}),new RTCSessionDescription({type:h.type,sdp:u})}function o(l,h){let u=h.sdp;return Object.keys(l._reverseStreams||[]).forEach(f=>{const d=l._reverseStreams[f],g=l._streams[d.id];u=u.replace(new RegExp(d.id,"g"),g.id)}),new RTCSessionDescription({type:h.type,sdp:u})}["createOffer","createAnswer"].forEach(function(l){const h=i.RTCPeerConnection.prototype[l],u={[l](){const f=arguments;return arguments.length&&typeof arguments[0]=="function"?h.apply(this,[g=>{const v=r(this,g);f[0].apply(null,[v])},g=>{f[1]&&f[1].apply(null,g)},arguments[2]]):h.apply(this,arguments).then(g=>r(this,g))}};i.RTCPeerConnection.prototype[l]=u[l]});const a=i.RTCPeerConnection.prototype.setLocalDescription;i.RTCPeerConnection.prototype.setLocalDescription=function(){return!arguments.length||!arguments[0].type?a.apply(this,arguments):(arguments[0]=o(this,arguments[0]),a.apply(this,arguments))};const c=Object.getOwnPropertyDescriptor(i.RTCPeerConnection.prototype,"localDescription");Object.defineProperty(i.RTCPeerConnection.prototype,"localDescription",{get(){const l=c.get.apply(this);return l.type===""?l:r(this,l)}}),i.RTCPeerConnection.prototype.removeTrack=function(h){if(this.signalingState==="closed")throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");if(!h._pc)throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.","TypeError");if(!(h._pc===this))throw new DOMException("Sender was not created by this connection.","InvalidAccessError");this._streams=this._streams||{};let f;Object.keys(this._streams).forEach(d=>{this._streams[d].getTracks().find(v=>h.track===v)&&(f=this._streams[d])}),f&&(f.getTracks().length===1?this.removeStream(this._reverseStreams[f.id]):f.removeTrack(h.track),this.dispatchEvent(new Event("negotiationneeded")))}}function nl(i,e){!i.RTCPeerConnection&&i.webkitRTCPeerConnection&&(i.RTCPeerConnection=i.webkitRTCPeerConnection),i.RTCPeerConnection&&e.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(t){const n=i.RTCPeerConnection.prototype[t],s={[t](){return arguments[0]=new(t==="addIceCandidate"?i.RTCIceCandidate:i.RTCSessionDescription)(arguments[0]),n.apply(this,arguments)}};i.RTCPeerConnection.prototype[t]=s[t]})}function cd(i,e){rs(i,"negotiationneeded",t=>{const n=t.target;if(!((e.version<72||n.getConfiguration&&n.getConfiguration().sdpSemantics==="plan-b")&&n.signalingState!=="stable"))return t})}const Ru=Object.freeze(Object.defineProperty({__proto__:null,fixNegotiationNeeded:cd,shimAddTrackRemoveTrack:ad,shimAddTrackRemoveTrackWithNative:od,shimGetSendersWithDtmf:sd,shimGetUserMedia:td,shimMediaStream:nd,shimOnTrack:id,shimPeerConnection:nl,shimSenderReceiverGetStats:rd},Symbol.toStringTag,{value:"Module"}));function ld(i,e){const t=i&&i.navigator,n=i&&i.MediaStreamTrack;if(t.getUserMedia=function(s,r,o){Vl("navigator.getUserMedia","navigator.mediaDevices.getUserMedia"),t.mediaDevices.getUserMedia(s).then(r,o)},!(e.version>55&&"autoGainControl"in t.mediaDevices.getSupportedConstraints())){const s=function(o,a,c){a in o&&!(c in o)&&(o[c]=o[a],delete o[a])},r=t.mediaDevices.getUserMedia.bind(t.mediaDevices);if(t.mediaDevices.getUserMedia=function(o){return typeof o=="object"&&typeof o.audio=="object"&&(o=JSON.parse(JSON.stringify(o)),s(o.audio,"autoGainControl","mozAutoGainControl"),s(o.audio,"noiseSuppression","mozNoiseSuppression")),r(o)},n&&n.prototype.getSettings){const o=n.prototype.getSettings;n.prototype.getSettings=function(){const a=o.apply(this,arguments);return s(a,"mozAutoGainControl","autoGainControl"),s(a,"mozNoiseSuppression","noiseSuppression"),a}}if(n&&n.prototype.applyConstraints){const o=n.prototype.applyConstraints;n.prototype.applyConstraints=function(a){return this.kind==="audio"&&typeof a=="object"&&(a=JSON.parse(JSON.stringify(a)),s(a,"autoGainControl","mozAutoGainControl"),s(a,"noiseSuppression","mozNoiseSuppression")),o.apply(this,[a])}}}}function FM(i,e){i.navigator.mediaDevices&&"getDisplayMedia"in i.navigator.mediaDevices||i.navigator.mediaDevices&&(i.navigator.mediaDevices.getDisplayMedia=function(n){if(!(n&&n.video)){const s=new DOMException("getDisplayMedia without video constraints is undefined");return s.name="NotFoundError",s.code=8,Promise.reject(s)}return n.video===!0?n.video={mediaSource:e}:n.video.mediaSource=e,i.navigator.mediaDevices.getUserMedia(n)})}function hd(i){typeof i=="object"&&i.RTCTrackEvent&&"receiver"in i.RTCTrackEvent.prototype&&!("transceiver"in i.RTCTrackEvent.prototype)&&Object.defineProperty(i.RTCTrackEvent.prototype,"transceiver",{get(){return{receiver:this.receiver}}})}function il(i,e){if(typeof i!="object"||!(i.RTCPeerConnection||i.mozRTCPeerConnection))return;!i.RTCPeerConnection&&i.mozRTCPeerConnection&&(i.RTCPeerConnection=i.mozRTCPeerConnection),e.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(s){const r=i.RTCPeerConnection.prototype[s],o={[s](){return arguments[0]=new(s==="addIceCandidate"?i.RTCIceCandidate:i.RTCSessionDescription)(arguments[0]),r.apply(this,arguments)}};i.RTCPeerConnection.prototype[s]=o[s]});const t={inboundrtp:"inbound-rtp",outboundrtp:"outbound-rtp",candidatepair:"candidate-pair",localcandidate:"local-candidate",remotecandidate:"remote-candidate"},n=i.RTCPeerConnection.prototype.getStats;i.RTCPeerConnection.prototype.getStats=function(){const[r,o,a]=arguments;return n.apply(this,[r||null]).then(c=>{if(e.version<53&&!o)try{c.forEach(l=>{l.type=t[l.type]||l.type})}catch(l){if(l.name!=="TypeError")throw l;c.forEach((h,u)=>{c.set(u,Object.assign({},h,{type:t[h.type]||h.type}))})}return c}).then(o,a)}}function ud(i){if(!(typeof i=="object"&&i.RTCPeerConnection&&i.RTCRtpSender)||i.RTCRtpSender&&"getStats"in i.RTCRtpSender.prototype)return;const e=i.RTCPeerConnection.prototype.getSenders;e&&(i.RTCPeerConnection.prototype.getSenders=function(){const s=e.apply(this,[]);return s.forEach(r=>r._pc=this),s});const t=i.RTCPeerConnection.prototype.addTrack;t&&(i.RTCPeerConnection.prototype.addTrack=function(){const s=t.apply(this,arguments);return s._pc=this,s}),i.RTCRtpSender.prototype.getStats=function(){return this.track?this._pc.getStats(this.track):Promise.resolve(new Map)}}function fd(i){if(!(typeof i=="object"&&i.RTCPeerConnection&&i.RTCRtpSender)||i.RTCRtpSender&&"getStats"in i.RTCRtpReceiver.prototype)return;const e=i.RTCPeerConnection.prototype.getReceivers;e&&(i.RTCPeerConnection.prototype.getReceivers=function(){const n=e.apply(this,[]);return n.forEach(s=>s._pc=this),n}),rs(i,"track",t=>(t.receiver._pc=t.srcElement,t)),i.RTCRtpReceiver.prototype.getStats=function(){return this._pc.getStats(this.track)}}function dd(i){!i.RTCPeerConnection||"removeStream"in i.RTCPeerConnection.prototype||(i.RTCPeerConnection.prototype.removeStream=function(t){Vl("removeStream","removeTrack"),this.getSenders().forEach(n=>{n.track&&t.getTracks().includes(n.track)&&this.removeTrack(n)})})}function pd(i){i.DataChannel&&!i.RTCDataChannel&&(i.RTCDataChannel=i.DataChannel)}function md(i){if(!(typeof i=="object"&&i.RTCPeerConnection))return;const e=i.RTCPeerConnection.prototype.addTransceiver;e&&(i.RTCPeerConnection.prototype.addTransceiver=function(){this.setParametersPromises=[];let n=arguments[1]&&arguments[1].sendEncodings;n===void 0&&(n=[]),n=[...n];const s=n.length>0;s&&n.forEach(o=>{if("rid"in o&&!/^[a-z0-9]{0,16}$/i.test(o.rid))throw new TypeError("Invalid RID value provided.");if("scaleResolutionDownBy"in o&&!(parseFloat(o.scaleResolutionDownBy)>=1))throw new RangeError("scale_resolution_down_by must be >= 1.0");if("maxFramerate"in o&&!(parseFloat(o.maxFramerate)>=0))throw new RangeError("max_framerate must be >= 0.0")});const r=e.apply(this,arguments);if(s){const{sender:o}=r,a=o.getParameters();(!("encodings"in a)||a.encodings.length===1&&Object.keys(a.encodings[0]).length===0)&&(a.encodings=n,o.sendEncodings=n,this.setParametersPromises.push(o.setParameters(a).then(()=>{delete o.sendEncodings}).catch(()=>{delete o.sendEncodings})))}return r})}function gd(i){if(!(typeof i=="object"&&i.RTCRtpSender))return;const e=i.RTCRtpSender.prototype.getParameters;e&&(i.RTCRtpSender.prototype.getParameters=function(){const n=e.apply(this,arguments);return"encodings"in n||(n.encodings=[].concat(this.sendEncodings||[{}])),n})}function _d(i){if(!(typeof i=="object"&&i.RTCPeerConnection))return;const e=i.RTCPeerConnection.prototype.createOffer;i.RTCPeerConnection.prototype.createOffer=function(){return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then(()=>e.apply(this,arguments)).finally(()=>{this.setParametersPromises=[]}):e.apply(this,arguments)}}function vd(i){if(!(typeof i=="object"&&i.RTCPeerConnection))return;const e=i.RTCPeerConnection.prototype.createAnswer;i.RTCPeerConnection.prototype.createAnswer=function(){return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then(()=>e.apply(this,arguments)).finally(()=>{this.setParametersPromises=[]}):e.apply(this,arguments)}}const Pu=Object.freeze(Object.defineProperty({__proto__:null,shimAddTransceiver:md,shimCreateAnswer:vd,shimCreateOffer:_d,shimGetDisplayMedia:FM,shimGetParameters:gd,shimGetUserMedia:ld,shimOnTrack:hd,shimPeerConnection:il,shimRTCDataChannel:pd,shimReceiverGetStats:fd,shimRemoveStream:dd,shimSenderGetStats:ud},Symbol.toStringTag,{value:"Module"}));function xd(i){if(!(typeof i!="object"||!i.RTCPeerConnection)){if("getLocalStreams"in i.RTCPeerConnection.prototype||(i.RTCPeerConnection.prototype.getLocalStreams=function(){return this._localStreams||(this._localStreams=[]),this._localStreams}),!("addStream"in i.RTCPeerConnection.prototype)){const e=i.RTCPeerConnection.prototype.addTrack;i.RTCPeerConnection.prototype.addStream=function(n){this._localStreams||(this._localStreams=[]),this._localStreams.includes(n)||this._localStreams.push(n),n.getAudioTracks().forEach(s=>e.call(this,s,n)),n.getVideoTracks().forEach(s=>e.call(this,s,n))},i.RTCPeerConnection.prototype.addTrack=function(n,...s){return s&&s.forEach(r=>{this._localStreams?this._localStreams.includes(r)||this._localStreams.push(r):this._localStreams=[r]}),e.apply(this,arguments)}}"removeStream"in i.RTCPeerConnection.prototype||(i.RTCPeerConnection.prototype.removeStream=function(t){this._localStreams||(this._localStreams=[]);const n=this._localStreams.indexOf(t);if(n===-1)return;this._localStreams.splice(n,1);const s=t.getTracks();this.getSenders().forEach(r=>{s.includes(r.track)&&this.removeTrack(r)})})}}function yd(i){if(!(typeof i!="object"||!i.RTCPeerConnection)&&("getRemoteStreams"in i.RTCPeerConnection.prototype||(i.RTCPeerConnection.prototype.getRemoteStreams=function(){return this._remoteStreams?this._remoteStreams:[]}),!("onaddstream"in i.RTCPeerConnection.prototype))){Object.defineProperty(i.RTCPeerConnection.prototype,"onaddstream",{get(){return this._onaddstream},set(t){this._onaddstream&&(this.removeEventListener("addstream",this._onaddstream),this.removeEventListener("track",this._onaddstreampoly)),this.addEventListener("addstream",this._onaddstream=t),this.addEventListener("track",this._onaddstreampoly=n=>{n.streams.forEach(s=>{if(this._remoteStreams||(this._remoteStreams=[]),this._remoteStreams.includes(s))return;this._remoteStreams.push(s);const r=new Event("addstream");r.stream=s,this.dispatchEvent(r)})})}});const e=i.RTCPeerConnection.prototype.setRemoteDescription;i.RTCPeerConnection.prototype.setRemoteDescription=function(){const n=this;return this._onaddstreampoly||this.addEventListener("track",this._onaddstreampoly=function(s){s.streams.forEach(r=>{if(n._remoteStreams||(n._remoteStreams=[]),n._remoteStreams.indexOf(r)>=0)return;n._remoteStreams.push(r);const o=new Event("addstream");o.stream=r,n.dispatchEvent(o)})}),e.apply(n,arguments)}}}function Md(i){if(typeof i!="object"||!i.RTCPeerConnection)return;const e=i.RTCPeerConnection.prototype,t=e.createOffer,n=e.createAnswer,s=e.setLocalDescription,r=e.setRemoteDescription,o=e.addIceCandidate;e.createOffer=function(l,h){const u=arguments.length>=2?arguments[2]:arguments[0],f=t.apply(this,[u]);return h?(f.then(l,h),Promise.resolve()):f},e.createAnswer=function(l,h){const u=arguments.length>=2?arguments[2]:arguments[0],f=n.apply(this,[u]);return h?(f.then(l,h),Promise.resolve()):f};let a=function(c,l,h){const u=s.apply(this,[c]);return h?(u.then(l,h),Promise.resolve()):u};e.setLocalDescription=a,a=function(c,l,h){const u=r.apply(this,[c]);return h?(u.then(l,h),Promise.resolve()):u},e.setRemoteDescription=a,a=function(c,l,h){const u=o.apply(this,[c]);return h?(u.then(l,h),Promise.resolve()):u},e.addIceCandidate=a}function Sd(i){const e=i&&i.navigator;if(e.mediaDevices&&e.mediaDevices.getUserMedia){const t=e.mediaDevices,n=t.getUserMedia.bind(t);e.mediaDevices.getUserMedia=s=>n(Ed(s))}!e.getUserMedia&&e.mediaDevices&&e.mediaDevices.getUserMedia&&(e.getUserMedia=function(n,s,r){e.mediaDevices.getUserMedia(n).then(s,r)}.bind(e))}function Ed(i){return i&&i.video!==void 0?Object.assign({},i,{video:ed(i.video)}):i}function Td(i){if(!i.RTCPeerConnection)return;const e=i.RTCPeerConnection;i.RTCPeerConnection=function(n,s){if(n&&n.iceServers){const r=[];for(let o=0;o<n.iceServers.length;o++){let a=n.iceServers[o];a.urls===void 0&&a.url?(Vl("RTCIceServer.url","RTCIceServer.urls"),a=JSON.parse(JSON.stringify(a)),a.urls=a.url,delete a.url,r.push(a)):r.push(n.iceServers[o])}n.iceServers=r}return new e(n,s)},i.RTCPeerConnection.prototype=e.prototype,"generateCertificate"in e&&Object.defineProperty(i.RTCPeerConnection,"generateCertificate",{get(){return e.generateCertificate}})}function bd(i){typeof i=="object"&&i.RTCTrackEvent&&"receiver"in i.RTCTrackEvent.prototype&&!("transceiver"in i.RTCTrackEvent.prototype)&&Object.defineProperty(i.RTCTrackEvent.prototype,"transceiver",{get(){return{receiver:this.receiver}}})}function wd(i){const e=i.RTCPeerConnection.prototype.createOffer;i.RTCPeerConnection.prototype.createOffer=function(n){if(n){typeof n.offerToReceiveAudio<"u"&&(n.offerToReceiveAudio=!!n.offerToReceiveAudio);const s=this.getTransceivers().find(o=>o.receiver.track.kind==="audio");n.offerToReceiveAudio===!1&&s?s.direction==="sendrecv"?s.setDirection?s.setDirection("sendonly"):s.direction="sendonly":s.direction==="recvonly"&&(s.setDirection?s.setDirection("inactive"):s.direction="inactive"):n.offerToReceiveAudio===!0&&!s&&this.addTransceiver("audio",{direction:"recvonly"}),typeof n.offerToReceiveVideo<"u"&&(n.offerToReceiveVideo=!!n.offerToReceiveVideo);const r=this.getTransceivers().find(o=>o.receiver.track.kind==="video");n.offerToReceiveVideo===!1&&r?r.direction==="sendrecv"?r.setDirection?r.setDirection("sendonly"):r.direction="sendonly":r.direction==="recvonly"&&(r.setDirection?r.setDirection("inactive"):r.direction="inactive"):n.offerToReceiveVideo===!0&&!r&&this.addTransceiver("video",{direction:"recvonly"})}return e.apply(this,arguments)}}function Cd(i){typeof i!="object"||i.AudioContext||(i.AudioContext=i.webkitAudioContext)}const Du=Object.freeze(Object.defineProperty({__proto__:null,shimAudioContext:Cd,shimCallbacksAPI:Md,shimConstraints:Ed,shimCreateOfferLegacy:wd,shimGetUserMedia:Sd,shimLocalStreamsAPI:xd,shimRTCIceServerUrls:Td,shimRemoteStreamsAPI:yd,shimTrackEventTransceiver:bd},Symbol.toStringTag,{value:"Module"}));function zM(i){return i&&i.__esModule&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i}var Ja={exports:{}},Iu;function BM(){return Iu||(Iu=1,(function(i){const e={};e.generateIdentifier=function(){return Math.random().toString(36).substring(2,12)},e.localCName=e.generateIdentifier(),e.splitLines=function(t){return t.trim().split(`
`).map(n=>n.trim())},e.splitSections=function(t){return t.split(`
m=`).map((s,r)=>(r>0?"m="+s:s).trim()+`\r
`)},e.getDescription=function(t){const n=e.splitSections(t);return n&&n[0]},e.getMediaSections=function(t){const n=e.splitSections(t);return n.shift(),n},e.matchPrefix=function(t,n){return e.splitLines(t).filter(s=>s.indexOf(n)===0)},e.parseCandidate=function(t){let n;t.indexOf("a=candidate:")===0?n=t.substring(12).split(" "):n=t.substring(10).split(" ");const s={foundation:n[0],component:{1:"rtp",2:"rtcp"}[n[1]]||n[1],protocol:n[2].toLowerCase(),priority:parseInt(n[3],10),ip:n[4],address:n[4],port:parseInt(n[5],10),type:n[7]};for(let r=8;r<n.length;r+=2)switch(n[r]){case"raddr":s.relatedAddress=n[r+1];break;case"rport":s.relatedPort=parseInt(n[r+1],10);break;case"tcptype":s.tcpType=n[r+1];break;case"ufrag":s.ufrag=n[r+1],s.usernameFragment=n[r+1];break;default:s[n[r]]===void 0&&(s[n[r]]=n[r+1]);break}return s},e.writeCandidate=function(t){const n=[];n.push(t.foundation);const s=t.component;s==="rtp"?n.push(1):s==="rtcp"?n.push(2):n.push(s),n.push(t.protocol.toUpperCase()),n.push(t.priority),n.push(t.address||t.ip),n.push(t.port);const r=t.type;return n.push("typ"),n.push(r),r!=="host"&&t.relatedAddress&&t.relatedPort&&(n.push("raddr"),n.push(t.relatedAddress),n.push("rport"),n.push(t.relatedPort)),t.tcpType&&t.protocol.toLowerCase()==="tcp"&&(n.push("tcptype"),n.push(t.tcpType)),(t.usernameFragment||t.ufrag)&&(n.push("ufrag"),n.push(t.usernameFragment||t.ufrag)),"candidate:"+n.join(" ")},e.parseIceOptions=function(t){return t.substring(14).split(" ")},e.parseRtpMap=function(t){let n=t.substring(9).split(" ");const s={payloadType:parseInt(n.shift(),10)};return n=n[0].split("/"),s.name=n[0],s.clockRate=parseInt(n[1],10),s.channels=n.length===3?parseInt(n[2],10):1,s.numChannels=s.channels,s},e.writeRtpMap=function(t){let n=t.payloadType;t.preferredPayloadType!==void 0&&(n=t.preferredPayloadType);const s=t.channels||t.numChannels||1;return"a=rtpmap:"+n+" "+t.name+"/"+t.clockRate+(s!==1?"/"+s:"")+`\r
`},e.parseExtmap=function(t){const n=t.substring(9).split(" ");return{id:parseInt(n[0],10),direction:n[0].indexOf("/")>0?n[0].split("/")[1]:"sendrecv",uri:n[1],attributes:n.slice(2).join(" ")}},e.writeExtmap=function(t){return"a=extmap:"+(t.id||t.preferredId)+(t.direction&&t.direction!=="sendrecv"?"/"+t.direction:"")+" "+t.uri+(t.attributes?" "+t.attributes:"")+`\r
`},e.parseFmtp=function(t){const n={};let s;const r=t.substring(t.indexOf(" ")+1).split(";");for(let o=0;o<r.length;o++)s=r[o].trim().split("="),n[s[0].trim()]=s[1];return n},e.writeFmtp=function(t){let n="",s=t.payloadType;if(t.preferredPayloadType!==void 0&&(s=t.preferredPayloadType),t.parameters&&Object.keys(t.parameters).length){const r=[];Object.keys(t.parameters).forEach(o=>{t.parameters[o]!==void 0?r.push(o+"="+t.parameters[o]):r.push(o)}),n+="a=fmtp:"+s+" "+r.join(";")+`\r
`}return n},e.parseRtcpFb=function(t){const n=t.substring(t.indexOf(" ")+1).split(" ");return{type:n.shift(),parameter:n.join(" ")}},e.writeRtcpFb=function(t){let n="",s=t.payloadType;return t.preferredPayloadType!==void 0&&(s=t.preferredPayloadType),t.rtcpFeedback&&t.rtcpFeedback.length&&t.rtcpFeedback.forEach(r=>{n+="a=rtcp-fb:"+s+" "+r.type+(r.parameter&&r.parameter.length?" "+r.parameter:"")+`\r
`}),n},e.parseSsrcMedia=function(t){const n=t.indexOf(" "),s={ssrc:parseInt(t.substring(7,n),10)},r=t.indexOf(":",n);return r>-1?(s.attribute=t.substring(n+1,r),s.value=t.substring(r+1)):s.attribute=t.substring(n+1),s},e.parseSsrcGroup=function(t){const n=t.substring(13).split(" ");return{semantics:n.shift(),ssrcs:n.map(s=>parseInt(s,10))}},e.getMid=function(t){const n=e.matchPrefix(t,"a=mid:")[0];if(n)return n.substring(6)},e.parseFingerprint=function(t){const n=t.substring(14).split(" ");return{algorithm:n[0].toLowerCase(),value:n[1].toUpperCase()}},e.getDtlsParameters=function(t,n){return{role:"auto",fingerprints:e.matchPrefix(t+n,"a=fingerprint:").map(e.parseFingerprint)}},e.writeDtlsParameters=function(t,n){let s="a=setup:"+n+`\r
`;return t.fingerprints.forEach(r=>{s+="a=fingerprint:"+r.algorithm+" "+r.value+`\r
`}),s},e.parseCryptoLine=function(t){const n=t.substring(9).split(" ");return{tag:parseInt(n[0],10),cryptoSuite:n[1],keyParams:n[2],sessionParams:n.slice(3)}},e.writeCryptoLine=function(t){return"a=crypto:"+t.tag+" "+t.cryptoSuite+" "+(typeof t.keyParams=="object"?e.writeCryptoKeyParams(t.keyParams):t.keyParams)+(t.sessionParams?" "+t.sessionParams.join(" "):"")+`\r
`},e.parseCryptoKeyParams=function(t){if(t.indexOf("inline:")!==0)return null;const n=t.substring(7).split("|");return{keyMethod:"inline",keySalt:n[0],lifeTime:n[1],mkiValue:n[2]?n[2].split(":")[0]:void 0,mkiLength:n[2]?n[2].split(":")[1]:void 0}},e.writeCryptoKeyParams=function(t){return t.keyMethod+":"+t.keySalt+(t.lifeTime?"|"+t.lifeTime:"")+(t.mkiValue&&t.mkiLength?"|"+t.mkiValue+":"+t.mkiLength:"")},e.getCryptoParameters=function(t,n){return e.matchPrefix(t+n,"a=crypto:").map(e.parseCryptoLine)},e.getIceParameters=function(t,n){const s=e.matchPrefix(t+n,"a=ice-ufrag:")[0],r=e.matchPrefix(t+n,"a=ice-pwd:")[0];return s&&r?{usernameFragment:s.substring(12),password:r.substring(10)}:null},e.writeIceParameters=function(t){let n="a=ice-ufrag:"+t.usernameFragment+`\r
a=ice-pwd:`+t.password+`\r
`;return t.iceLite&&(n+=`a=ice-lite\r
`),n},e.parseRtpParameters=function(t){const n={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},r=e.splitLines(t)[0].split(" ");n.profile=r[2];for(let a=3;a<r.length;a++){const c=r[a],l=e.matchPrefix(t,"a=rtpmap:"+c+" ")[0];if(l){const h=e.parseRtpMap(l),u=e.matchPrefix(t,"a=fmtp:"+c+" ");switch(h.parameters=u.length?e.parseFmtp(u[0]):{},h.rtcpFeedback=e.matchPrefix(t,"a=rtcp-fb:"+c+" ").map(e.parseRtcpFb),n.codecs.push(h),h.name.toUpperCase()){case"RED":case"ULPFEC":n.fecMechanisms.push(h.name.toUpperCase());break}}}e.matchPrefix(t,"a=extmap:").forEach(a=>{n.headerExtensions.push(e.parseExtmap(a))});const o=e.matchPrefix(t,"a=rtcp-fb:* ").map(e.parseRtcpFb);return n.codecs.forEach(a=>{o.forEach(c=>{a.rtcpFeedback.find(h=>h.type===c.type&&h.parameter===c.parameter)||a.rtcpFeedback.push(c)})}),n},e.writeRtpDescription=function(t,n){let s="";s+="m="+t+" ",s+=n.codecs.length>0?"9":"0",s+=" "+(n.profile||"UDP/TLS/RTP/SAVPF")+" ",s+=n.codecs.map(o=>o.preferredPayloadType!==void 0?o.preferredPayloadType:o.payloadType).join(" ")+`\r
`,s+=`c=IN IP4 0.0.0.0\r
`,s+=`a=rtcp:9 IN IP4 0.0.0.0\r
`,n.codecs.forEach(o=>{s+=e.writeRtpMap(o),s+=e.writeFmtp(o),s+=e.writeRtcpFb(o)});let r=0;return n.codecs.forEach(o=>{o.maxptime>r&&(r=o.maxptime)}),r>0&&(s+="a=maxptime:"+r+`\r
`),n.headerExtensions&&n.headerExtensions.forEach(o=>{s+=e.writeExtmap(o)}),s},e.parseRtpEncodingParameters=function(t){const n=[],s=e.parseRtpParameters(t),r=s.fecMechanisms.indexOf("RED")!==-1,o=s.fecMechanisms.indexOf("ULPFEC")!==-1,a=e.matchPrefix(t,"a=ssrc:").map(f=>e.parseSsrcMedia(f)).filter(f=>f.attribute==="cname"),c=a.length>0&&a[0].ssrc;let l;const h=e.matchPrefix(t,"a=ssrc-group:FID").map(f=>f.substring(17).split(" ").map(g=>parseInt(g,10)));h.length>0&&h[0].length>1&&h[0][0]===c&&(l=h[0][1]),s.codecs.forEach(f=>{if(f.name.toUpperCase()==="RTX"&&f.parameters.apt){let d={ssrc:c,codecPayloadType:parseInt(f.parameters.apt,10)};c&&l&&(d.rtx={ssrc:l}),n.push(d),r&&(d=JSON.parse(JSON.stringify(d)),d.fec={ssrc:c,mechanism:o?"red+ulpfec":"red"},n.push(d))}}),n.length===0&&c&&n.push({ssrc:c});let u=e.matchPrefix(t,"b=");return u.length&&(u[0].indexOf("b=TIAS:")===0?u=parseInt(u[0].substring(7),10):u[0].indexOf("b=AS:")===0?u=parseInt(u[0].substring(5),10)*1e3*.95-2e3*8:u=void 0,n.forEach(f=>{f.maxBitrate=u})),n},e.parseRtcpParameters=function(t){const n={},s=e.matchPrefix(t,"a=ssrc:").map(a=>e.parseSsrcMedia(a)).filter(a=>a.attribute==="cname")[0];s&&(n.cname=s.value,n.ssrc=s.ssrc);const r=e.matchPrefix(t,"a=rtcp-rsize");n.reducedSize=r.length>0,n.compound=r.length===0;const o=e.matchPrefix(t,"a=rtcp-mux");return n.mux=o.length>0,n},e.writeRtcpParameters=function(t){let n="";return t.reducedSize&&(n+=`a=rtcp-rsize\r
`),t.mux&&(n+=`a=rtcp-mux\r
`),t.ssrc!==void 0&&t.cname&&(n+="a=ssrc:"+t.ssrc+" cname:"+t.cname+`\r
`),n},e.parseMsid=function(t){let n;const s=e.matchPrefix(t,"a=msid:");if(s.length===1)return n=s[0].substring(7).split(" "),{stream:n[0],track:n[1]};const r=e.matchPrefix(t,"a=ssrc:").map(o=>e.parseSsrcMedia(o)).filter(o=>o.attribute==="msid");if(r.length>0)return n=r[0].value.split(" "),{stream:n[0],track:n[1]}},e.parseSctpDescription=function(t){const n=e.parseMLine(t),s=e.matchPrefix(t,"a=max-message-size:");let r;s.length>0&&(r=parseInt(s[0].substring(19),10)),isNaN(r)&&(r=65536);const o=e.matchPrefix(t,"a=sctp-port:");if(o.length>0)return{port:parseInt(o[0].substring(12),10),protocol:n.fmt,maxMessageSize:r};const a=e.matchPrefix(t,"a=sctpmap:");if(a.length>0){const c=a[0].substring(10).split(" ");return{port:parseInt(c[0],10),protocol:c[1],maxMessageSize:r}}},e.writeSctpDescription=function(t,n){let s=[];return t.protocol!=="DTLS/SCTP"?s=["m="+t.kind+" 9 "+t.protocol+" "+n.protocol+`\r
`,`c=IN IP4 0.0.0.0\r
`,"a=sctp-port:"+n.port+`\r
`]:s=["m="+t.kind+" 9 "+t.protocol+" "+n.port+`\r
`,`c=IN IP4 0.0.0.0\r
`,"a=sctpmap:"+n.port+" "+n.protocol+` 65535\r
`],n.maxMessageSize!==void 0&&s.push("a=max-message-size:"+n.maxMessageSize+`\r
`),s.join("")},e.generateSessionId=function(){return Math.random().toString().substr(2,22)},e.writeSessionBoilerplate=function(t,n,s){let r;const o=n!==void 0?n:2;return t?r=t:r=e.generateSessionId(),`v=0\r
o=`+(s||"thisisadapterortc")+" "+r+" "+o+` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`},e.getDirection=function(t,n){const s=e.splitLines(t);for(let r=0;r<s.length;r++)switch(s[r]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return s[r].substring(2)}return n?e.getDirection(n):"sendrecv"},e.getKind=function(t){return e.splitLines(t)[0].split(" ")[0].substring(2)},e.isRejected=function(t){return t.split(" ",2)[1]==="0"},e.parseMLine=function(t){const s=e.splitLines(t)[0].substring(2).split(" ");return{kind:s[0],port:parseInt(s[1],10),protocol:s[2],fmt:s.slice(3).join(" ")}},e.parseOLine=function(t){const s=e.matchPrefix(t,"o=")[0].substring(2).split(" ");return{username:s[0],sessionId:s[1],sessionVersion:parseInt(s[2],10),netType:s[3],addressType:s[4],address:s[5]}},e.isValidSDP=function(t){if(typeof t!="string"||t.length===0)return!1;const n=e.splitLines(t);for(let s=0;s<n.length;s++)if(n[s].length<2||n[s].charAt(1)!=="=")return!1;return!0},i.exports=e})(Ja)),Ja.exports}var Ad=BM();const Hs=zM(Ad),kM=sp({__proto__:null,default:Hs},[Ad]);function Fo(i){if(!i.RTCIceCandidate||i.RTCIceCandidate&&"foundation"in i.RTCIceCandidate.prototype)return;const e=i.RTCIceCandidate;i.RTCIceCandidate=function(n){if(typeof n=="object"&&n.candidate&&n.candidate.indexOf("a=")===0&&(n=JSON.parse(JSON.stringify(n)),n.candidate=n.candidate.substring(2)),n.candidate&&n.candidate.length){const s=new e(n),r=Hs.parseCandidate(n.candidate);for(const o in r)o in s||Object.defineProperty(s,o,{value:r[o]});return s.toJSON=function(){return{candidate:s.candidate,sdpMid:s.sdpMid,sdpMLineIndex:s.sdpMLineIndex,usernameFragment:s.usernameFragment}},s}return new e(n)},i.RTCIceCandidate.prototype=e.prototype,rs(i,"icecandidate",t=>(t.candidate&&Object.defineProperty(t,"candidate",{value:new i.RTCIceCandidate(t.candidate),writable:"false"}),t))}function sl(i){!i.RTCIceCandidate||i.RTCIceCandidate&&"relayProtocol"in i.RTCIceCandidate.prototype||rs(i,"icecandidate",e=>{if(e.candidate){const t=Hs.parseCandidate(e.candidate.candidate);t.type==="relay"&&(e.candidate.relayProtocol={0:"tls",1:"tcp",2:"udp"}[t.priority>>24])}return e})}function zo(i,e){if(!i.RTCPeerConnection)return;"sctp"in i.RTCPeerConnection.prototype||Object.defineProperty(i.RTCPeerConnection.prototype,"sctp",{get(){return typeof this._sctp>"u"?null:this._sctp}});const t=function(a){if(!a||!a.sdp)return!1;const c=Hs.splitSections(a.sdp);return c.shift(),c.some(l=>{const h=Hs.parseMLine(l);return h&&h.kind==="application"&&h.protocol.indexOf("SCTP")!==-1})},n=function(a){const c=a.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);if(c===null||c.length<2)return-1;const l=parseInt(c[1],10);return l!==l?-1:l},s=function(a){let c=65536;return e.browser==="firefox"&&(e.version<57?a===-1?c=16384:c=2147483637:e.version<60?c=e.version===57?65535:65536:c=2147483637),c},r=function(a,c){let l=65536;e.browser==="firefox"&&e.version===57&&(l=65535);const h=Hs.matchPrefix(a.sdp,"a=max-message-size:");return h.length>0?l=parseInt(h[0].substring(19),10):e.browser==="firefox"&&c!==-1&&(l=2147483637),l},o=i.RTCPeerConnection.prototype.setRemoteDescription;i.RTCPeerConnection.prototype.setRemoteDescription=function(){if(this._sctp=null,e.browser==="chrome"&&e.version>=76){const{sdpSemantics:c}=this.getConfiguration();c==="plan-b"&&Object.defineProperty(this,"sctp",{get(){return typeof this._sctp>"u"?null:this._sctp},enumerable:!0,configurable:!0})}if(t(arguments[0])){const c=n(arguments[0]),l=s(c),h=r(arguments[0],c);let u;l===0&&h===0?u=Number.POSITIVE_INFINITY:l===0||h===0?u=Math.max(l,h):u=Math.min(l,h);const f={};Object.defineProperty(f,"maxMessageSize",{get(){return u}}),this._sctp=f}return o.apply(this,arguments)}}function Bo(i){if(!(i.RTCPeerConnection&&"createDataChannel"in i.RTCPeerConnection.prototype))return;function e(n,s){const r=n.send;n.send=function(){const a=arguments[0],c=a.length||a.size||a.byteLength;if(n.readyState==="open"&&s.sctp&&c>s.sctp.maxMessageSize)throw new TypeError("Message too large (can send a maximum of "+s.sctp.maxMessageSize+" bytes)");return r.apply(n,arguments)}}const t=i.RTCPeerConnection.prototype.createDataChannel;i.RTCPeerConnection.prototype.createDataChannel=function(){const s=t.apply(this,arguments);return e(s,this),s},rs(i,"datachannel",n=>(e(n.channel,n.target),n))}function rl(i){if(!i.RTCPeerConnection||"connectionState"in i.RTCPeerConnection.prototype)return;const e=i.RTCPeerConnection.prototype;Object.defineProperty(e,"connectionState",{get(){return{completed:"connected",checking:"connecting"}[this.iceConnectionState]||this.iceConnectionState},enumerable:!0,configurable:!0}),Object.defineProperty(e,"onconnectionstatechange",{get(){return this._onconnectionstatechange||null},set(t){this._onconnectionstatechange&&(this.removeEventListener("connectionstatechange",this._onconnectionstatechange),delete this._onconnectionstatechange),t&&this.addEventListener("connectionstatechange",this._onconnectionstatechange=t)},enumerable:!0,configurable:!0}),["setLocalDescription","setRemoteDescription"].forEach(t=>{const n=e[t];e[t]=function(){return this._connectionstatechangepoly||(this._connectionstatechangepoly=s=>{const r=s.target;if(r._lastConnectionState!==r.connectionState){r._lastConnectionState=r.connectionState;const o=new Event("connectionstatechange",s);r.dispatchEvent(o)}return s},this.addEventListener("iceconnectionstatechange",this._connectionstatechangepoly)),n.apply(this,arguments)}})}function ol(i,e){if(!i.RTCPeerConnection||e.browser==="chrome"&&e.version>=71||e.browser==="safari"&&e._safariVersion>=13.1)return;const t=i.RTCPeerConnection.prototype.setRemoteDescription;i.RTCPeerConnection.prototype.setRemoteDescription=function(s){if(s&&s.sdp&&s.sdp.indexOf(`
a=extmap-allow-mixed`)!==-1){const r=s.sdp.split(`
`).filter(o=>o.trim()!=="a=extmap-allow-mixed").join(`
`);i.RTCSessionDescription&&s instanceof i.RTCSessionDescription?arguments[0]=new i.RTCSessionDescription({type:s.type,sdp:r}):s.sdp=r}return t.apply(this,arguments)}}function ko(i,e){if(!(i.RTCPeerConnection&&i.RTCPeerConnection.prototype))return;const t=i.RTCPeerConnection.prototype.addIceCandidate;!t||t.length===0||(i.RTCPeerConnection.prototype.addIceCandidate=function(){return arguments[0]?(e.browser==="chrome"&&e.version<78||e.browser==="firefox"&&e.version<68||e.browser==="safari")&&arguments[0]&&arguments[0].candidate===""?Promise.resolve():t.apply(this,arguments):(arguments[1]&&arguments[1].apply(null),Promise.resolve())})}function Ho(i,e){if(!(i.RTCPeerConnection&&i.RTCPeerConnection.prototype))return;const t=i.RTCPeerConnection.prototype.setLocalDescription;!t||t.length===0||(i.RTCPeerConnection.prototype.setLocalDescription=function(){let s=arguments[0]||{};if(typeof s!="object"||s.type&&s.sdp)return t.apply(this,arguments);if(s={type:s.type,sdp:s.sdp},!s.type)switch(this.signalingState){case"stable":case"have-local-offer":case"have-remote-pranswer":s.type="offer";break;default:s.type="answer";break}return s.sdp||s.type!=="offer"&&s.type!=="answer"?t.apply(this,[s]):(s.type==="offer"?this.createOffer:this.createAnswer).apply(this).then(o=>t.apply(this,[o]))})}const HM=Object.freeze(Object.defineProperty({__proto__:null,removeExtmapAllowMixed:ol,shimAddIceCandidateNullOrEmpty:ko,shimConnectionState:rl,shimMaxMessageSize:zo,shimParameterlessSetLocalDescription:Ho,shimRTCIceCandidate:Fo,shimRTCIceCandidateRelayProtocol:sl,shimSendThrowTypeError:Bo},Symbol.toStringTag,{value:"Module"}));function GM({window:i}={},e={shimChrome:!0,shimFirefox:!0,shimSafari:!0}){const t=Qf,n=OM(i),s={browserDetails:n,commonShim:HM,extractVersion:Sr,disableLog:UM,disableWarnings:NM,sdp:kM};switch(n.browser){case"chrome":if(!Ru||!nl||!e.shimChrome)return t("Chrome shim is not included in this adapter release."),s;if(n.version===null)return t("Chrome shim can not determine version, not shimming."),s;t("adapter.js shimming chrome."),s.browserShim=Ru,ko(i,n),Ho(i),td(i,n),nd(i),nl(i,n),id(i),ad(i,n),sd(i),rd(i),cd(i,n),Fo(i),sl(i),rl(i),zo(i,n),Bo(i),ol(i,n);break;case"firefox":if(!Pu||!il||!e.shimFirefox)return t("Firefox shim is not included in this adapter release."),s;t("adapter.js shimming firefox."),s.browserShim=Pu,ko(i,n),Ho(i),ld(i,n),il(i,n),hd(i),dd(i),ud(i),fd(i),pd(i),md(i),gd(i),_d(i),vd(i),Fo(i),rl(i),zo(i,n),Bo(i);break;case"safari":if(!Du||!e.shimSafari)return t("Safari shim is not included in this adapter release."),s;t("adapter.js shimming safari."),s.browserShim=Du,ko(i,n),Ho(i),Td(i),wd(i),Md(i),xd(i),yd(i),bd(i),Sd(i),Cd(i),Fo(i),sl(i),zo(i,n),Bo(i),ol(i,n);break;default:t("Unsupported browser!");break}return s}const Lu=GM({window:typeof window>"u"?void 0:window});function os(i,e,t,n){Object.defineProperty(i,e,{get:t,set:n,enumerable:!0,configurable:!0})}class Rd{constructor(){this.chunkedMTU=16300,this._dataCount=1,this.chunk=e=>{const t=[],n=e.byteLength,s=Math.ceil(n/this.chunkedMTU);let r=0,o=0;for(;o<n;){const a=Math.min(n,o+this.chunkedMTU),c=e.slice(o,a),l={__peerData:this._dataCount,n:r,data:c,total:s};t.push(l),o=a,r++}return this._dataCount++,t}}}function VM(i){let e=0;for(const s of i)e+=s.byteLength;const t=new Uint8Array(e);let n=0;for(const s of i)t.set(s,n),n+=s.byteLength;return t}const Qa=Lu.default||Lu,_r=new class{isWebRTCSupported(){return typeof RTCPeerConnection<"u"}isBrowserSupported(){const i=this.getBrowser(),e=this.getVersion();return this.supportedBrowsers.includes(i)?i==="chrome"?e>=this.minChromeVersion:i==="firefox"?e>=this.minFirefoxVersion:i==="safari"?!this.isIOS&&e>=this.minSafariVersion:!1:!1}getBrowser(){return Qa.browserDetails.browser}getVersion(){return Qa.browserDetails.version||0}isUnifiedPlanSupported(){const i=this.getBrowser(),e=Qa.browserDetails.version||0;if(i==="chrome"&&e<this.minChromeVersion)return!1;if(i==="firefox"&&e>=this.minFirefoxVersion)return!0;if(!window.RTCRtpTransceiver||!("currentDirection"in RTCRtpTransceiver.prototype))return!1;let t,n=!1;try{t=new RTCPeerConnection,t.addTransceiver("audio"),n=!0}catch{}finally{t&&t.close()}return n}toString(){return`Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`}constructor(){this.isIOS=typeof navigator<"u"?["iPad","iPhone","iPod"].includes(navigator.platform):!1,this.supportedBrowsers=["firefox","chrome","safari"],this.minFirefoxVersion=59,this.minChromeVersion=72,this.minSafariVersion=605}},WM=i=>!i||/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(i),Pd=()=>Math.random().toString(36).slice(2),Uu={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:["turn:eu-0.turn.peerjs.com:3478","turn:us-0.turn.peerjs.com:3478"],username:"peerjs",credential:"peerjsp"}],sdpSemantics:"unified-plan"};class XM extends Rd{noop(){}blobToArrayBuffer(e,t){const n=new FileReader;return n.onload=function(s){s.target&&t(s.target.result)},n.readAsArrayBuffer(e),n}binaryStringToArrayBuffer(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n)&255;return t.buffer}isSecure(){return location.protocol==="https:"}constructor(...e){super(...e),this.CLOUD_HOST="0.peerjs.com",this.CLOUD_PORT=443,this.chunkedBrowsers={Chrome:1,chrome:1},this.defaultConfig=Uu,this.browser=_r.getBrowser(),this.browserVersion=_r.getVersion(),this.pack=Kf,this.unpack=jf,this.supports=(function(){const t={browser:_r.isBrowserSupported(),webRTC:_r.isWebRTCSupported(),audioVideo:!1,data:!1,binaryBlob:!1,reliable:!1};if(!t.webRTC)return t;let n;try{n=new RTCPeerConnection(Uu),t.audioVideo=!0;let s;try{s=n.createDataChannel("_PEERJSTEST",{ordered:!0}),t.data=!0,t.reliable=!!s.ordered;try{s.binaryType="blob",t.binaryBlob=!_r.isIOS}catch{}}catch{}finally{s&&s.close()}}catch{}finally{n&&n.close()}return t})(),this.validateId=WM,this.randomToken=Pd}}const hn=new XM,$M="PeerJS: ";class qM{get logLevel(){return this._logLevel}set logLevel(e){this._logLevel=e}log(...e){this._logLevel>=3&&this._print(3,...e)}warn(...e){this._logLevel>=2&&this._print(2,...e)}error(...e){this._logLevel>=1&&this._print(1,...e)}setLogFunction(e){this._print=e}_print(e,...t){const n=[$M,...t];for(const s in n)n[s]instanceof Error&&(n[s]="("+n[s].name+") "+n[s].message);e>=3?console.log(...n):e>=2?console.warn("WARNING",...n):e>=1&&console.error("ERROR",...n)}constructor(){this._logLevel=0}}var Pe=new qM,Wl={},YM=Object.prototype.hasOwnProperty,an="~";function Gr(){}Object.create&&(Gr.prototype=Object.create(null),new Gr().__proto__||(an=!1));function jM(i,e,t){this.fn=i,this.context=e,this.once=t||!1}function Dd(i,e,t,n,s){if(typeof t!="function")throw new TypeError("The listener must be a function");var r=new jM(t,n||i,s),o=an?an+e:e;return i._events[o]?i._events[o].fn?i._events[o]=[i._events[o],r]:i._events[o].push(r):(i._events[o]=r,i._eventsCount++),i}function Go(i,e){--i._eventsCount===0?i._events=new Gr:delete i._events[e]}function Qt(){this._events=new Gr,this._eventsCount=0}Qt.prototype.eventNames=function(){var e=[],t,n;if(this._eventsCount===0)return e;for(n in t=this._events)YM.call(t,n)&&e.push(an?n.slice(1):n);return Object.getOwnPropertySymbols?e.concat(Object.getOwnPropertySymbols(t)):e};Qt.prototype.listeners=function(e){var t=an?an+e:e,n=this._events[t];if(!n)return[];if(n.fn)return[n.fn];for(var s=0,r=n.length,o=new Array(r);s<r;s++)o[s]=n[s].fn;return o};Qt.prototype.listenerCount=function(e){var t=an?an+e:e,n=this._events[t];return n?n.fn?1:n.length:0};Qt.prototype.emit=function(e,t,n,s,r,o){var a=an?an+e:e;if(!this._events[a])return!1;var c=this._events[a],l=arguments.length,h,u;if(c.fn){switch(c.once&&this.removeListener(e,c.fn,void 0,!0),l){case 1:return c.fn.call(c.context),!0;case 2:return c.fn.call(c.context,t),!0;case 3:return c.fn.call(c.context,t,n),!0;case 4:return c.fn.call(c.context,t,n,s),!0;case 5:return c.fn.call(c.context,t,n,s,r),!0;case 6:return c.fn.call(c.context,t,n,s,r,o),!0}for(u=1,h=new Array(l-1);u<l;u++)h[u-1]=arguments[u];c.fn.apply(c.context,h)}else{var f=c.length,d;for(u=0;u<f;u++)switch(c[u].once&&this.removeListener(e,c[u].fn,void 0,!0),l){case 1:c[u].fn.call(c[u].context);break;case 2:c[u].fn.call(c[u].context,t);break;case 3:c[u].fn.call(c[u].context,t,n);break;case 4:c[u].fn.call(c[u].context,t,n,s);break;default:if(!h)for(d=1,h=new Array(l-1);d<l;d++)h[d-1]=arguments[d];c[u].fn.apply(c[u].context,h)}}return!0};Qt.prototype.on=function(e,t,n){return Dd(this,e,t,n,!1)};Qt.prototype.once=function(e,t,n){return Dd(this,e,t,n,!0)};Qt.prototype.removeListener=function(e,t,n,s){var r=an?an+e:e;if(!this._events[r])return this;if(!t)return Go(this,r),this;var o=this._events[r];if(o.fn)o.fn===t&&(!s||o.once)&&(!n||o.context===n)&&Go(this,r);else{for(var a=0,c=[],l=o.length;a<l;a++)(o[a].fn!==t||s&&!o[a].once||n&&o[a].context!==n)&&c.push(o[a]);c.length?this._events[r]=c.length===1?c[0]:c:Go(this,r)}return this};Qt.prototype.removeAllListeners=function(e){var t;return e?(t=an?an+e:e,this._events[t]&&Go(this,t)):(this._events=new Gr,this._eventsCount=0),this};Qt.prototype.off=Qt.prototype.removeListener;Qt.prototype.addListener=Qt.prototype.on;Qt.prefixed=an;Qt.EventEmitter=Qt;Wl=Qt;var as={};os(as,"ConnectionType",()=>Ci);os(as,"PeerErrorType",()=>Ut);os(as,"BaseConnectionErrorType",()=>al);os(as,"DataConnectionErrorType",()=>Xl);os(as,"SerializationType",()=>fa);os(as,"SocketEventType",()=>bi);os(as,"ServerMessageType",()=>jt);var Ci=(function(i){return i.Data="data",i.Media="media",i})({}),Ut=(function(i){return i.BrowserIncompatible="browser-incompatible",i.Disconnected="disconnected",i.InvalidID="invalid-id",i.InvalidKey="invalid-key",i.Network="network",i.PeerUnavailable="peer-unavailable",i.SslUnavailable="ssl-unavailable",i.ServerError="server-error",i.SocketError="socket-error",i.SocketClosed="socket-closed",i.UnavailableID="unavailable-id",i.WebRTC="webrtc",i})({}),al=(function(i){return i.NegotiationFailed="negotiation-failed",i.ConnectionClosed="connection-closed",i})({}),Xl=(function(i){return i.NotOpenYet="not-open-yet",i.MessageToBig="message-too-big",i})({}),fa=(function(i){return i.Binary="binary",i.BinaryUTF8="binary-utf8",i.JSON="json",i.None="raw",i})({}),bi=(function(i){return i.Message="message",i.Disconnected="disconnected",i.Error="error",i.Close="close",i})({}),jt=(function(i){return i.Heartbeat="HEARTBEAT",i.Candidate="CANDIDATE",i.Offer="OFFER",i.Answer="ANSWER",i.Open="OPEN",i.Error="ERROR",i.IdTaken="ID-TAKEN",i.InvalidKey="INVALID-KEY",i.Leave="LEAVE",i.Expire="EXPIRE",i})({});const Id="1.5.5";class KM extends Wl.EventEmitter{constructor(e,t,n,s,r,o=5e3){super(),this.pingInterval=o,this._disconnected=!0,this._messagesQueue=[];const a=e?"wss://":"ws://";this._baseUrl=a+t+":"+n+s+"peerjs?key="+r}start(e,t){this._id=e;const n=`${this._baseUrl}&id=${e}&token=${t}`;this._socket||!this._disconnected||(this._socket=new WebSocket(n+"&version="+Id),this._disconnected=!1,this._socket.onmessage=s=>{let r;try{r=JSON.parse(s.data),Pe.log("Server message received:",r)}catch{Pe.log("Invalid server message",s.data);return}this.emit(bi.Message,r)},this._socket.onclose=s=>{this._disconnected||(Pe.log("Socket closed.",s),this._cleanup(),this._disconnected=!0,this.emit(bi.Disconnected))},this._socket.onopen=()=>{this._disconnected||(this._sendQueuedMessages(),Pe.log("Socket open"),this._scheduleHeartbeat())})}_scheduleHeartbeat(){this._wsPingTimer=setTimeout(()=>{this._sendHeartbeat()},this.pingInterval)}_sendHeartbeat(){if(!this._wsOpen()){Pe.log("Cannot send heartbeat, because socket closed");return}const e=JSON.stringify({type:jt.Heartbeat});this._socket.send(e),this._scheduleHeartbeat()}_wsOpen(){return!!this._socket&&this._socket.readyState===1}_sendQueuedMessages(){const e=[...this._messagesQueue];this._messagesQueue=[];for(const t of e)this.send(t)}send(e){if(this._disconnected)return;if(!this._id){this._messagesQueue.push(e);return}if(!e.type){this.emit(bi.Error,"Invalid message");return}if(!this._wsOpen())return;const t=JSON.stringify(e);this._socket.send(t)}close(){this._disconnected||(this._cleanup(),this._disconnected=!0)}_cleanup(){this._socket&&(this._socket.onopen=this._socket.onmessage=this._socket.onclose=null,this._socket.close(),this._socket=void 0),clearTimeout(this._wsPingTimer)}}class Ld{constructor(e){this.connection=e}startConnection(e){const t=this._startPeerConnection();if(this.connection.peerConnection=t,this.connection.type===Ci.Media&&e._stream&&this._addTracksToConnection(e._stream,t),e.originator){const n=this.connection,s={ordered:!!e.reliable},r=t.createDataChannel(n.label,s);n._initializeDataChannel(r),this._makeOffer()}else this.handleSDP("OFFER",e.sdp)}_startPeerConnection(){Pe.log("Creating RTCPeerConnection.");const e=new RTCPeerConnection(this.connection.provider.options.config);return this._setupListeners(e),e}_setupListeners(e){const t=this.connection.peer,n=this.connection.connectionId,s=this.connection.type,r=this.connection.provider;Pe.log("Listening for ICE candidates."),e.onicecandidate=o=>{!o.candidate||!o.candidate.candidate||(Pe.log(`Received ICE candidates for ${t}:`,o.candidate),r.socket.send({type:jt.Candidate,payload:{candidate:o.candidate,type:s,connectionId:n},dst:t}))},e.oniceconnectionstatechange=()=>{switch(e.iceConnectionState){case"failed":Pe.log("iceConnectionState is failed, closing connections to "+t),this.connection.emitError(al.NegotiationFailed,"Negotiation of connection to "+t+" failed."),this.connection.close();break;case"closed":Pe.log("iceConnectionState is closed, closing connections to "+t),this.connection.emitError(al.ConnectionClosed,"Connection to "+t+" closed."),this.connection.close();break;case"disconnected":Pe.log("iceConnectionState changed to disconnected on the connection with "+t);break;case"completed":e.onicecandidate=()=>{};break}this.connection.emit("iceStateChanged",e.iceConnectionState)},Pe.log("Listening for data channel"),e.ondatachannel=o=>{Pe.log("Received data channel");const a=o.channel;r.getConnection(t,n)._initializeDataChannel(a)},Pe.log("Listening for remote stream"),e.ontrack=o=>{Pe.log("Received remote stream");const a=o.streams[0],c=r.getConnection(t,n);if(c.type===Ci.Media){const l=c;this._addStreamToMediaConnection(a,l)}}}cleanup(){Pe.log("Cleaning up PeerConnection to "+this.connection.peer);const e=this.connection.peerConnection;if(!e)return;this.connection.peerConnection=null,e.onicecandidate=e.oniceconnectionstatechange=e.ondatachannel=e.ontrack=()=>{};const t=e.signalingState!=="closed";let n=!1;const s=this.connection.dataChannel;s&&(n=!!s.readyState&&s.readyState!=="closed"),(t||n)&&e.close()}async _makeOffer(){const e=this.connection.peerConnection,t=this.connection.provider;try{const n=await e.createOffer(this.connection.options.constraints);Pe.log("Created offer."),this.connection.options.sdpTransform&&typeof this.connection.options.sdpTransform=="function"&&(n.sdp=this.connection.options.sdpTransform(n.sdp)||n.sdp);try{await e.setLocalDescription(n),Pe.log("Set localDescription:",n,`for:${this.connection.peer}`);let s={sdp:n,type:this.connection.type,connectionId:this.connection.connectionId,metadata:this.connection.metadata};if(this.connection.type===Ci.Data){const r=this.connection;s={...s,label:r.label,reliable:r.reliable,serialization:r.serialization}}t.socket.send({type:jt.Offer,payload:s,dst:this.connection.peer})}catch(s){s!="OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer"&&(t.emitError(Ut.WebRTC,s),Pe.log("Failed to setLocalDescription, ",s))}}catch(n){t.emitError(Ut.WebRTC,n),Pe.log("Failed to createOffer, ",n)}}async _makeAnswer(){const e=this.connection.peerConnection,t=this.connection.provider;try{const n=await e.createAnswer();Pe.log("Created answer."),this.connection.options.sdpTransform&&typeof this.connection.options.sdpTransform=="function"&&(n.sdp=this.connection.options.sdpTransform(n.sdp)||n.sdp);try{await e.setLocalDescription(n),Pe.log("Set localDescription:",n,`for:${this.connection.peer}`),t.socket.send({type:jt.Answer,payload:{sdp:n,type:this.connection.type,connectionId:this.connection.connectionId},dst:this.connection.peer})}catch(s){t.emitError(Ut.WebRTC,s),Pe.log("Failed to setLocalDescription, ",s)}}catch(n){t.emitError(Ut.WebRTC,n),Pe.log("Failed to create answer, ",n)}}async handleSDP(e,t){t=new RTCSessionDescription(t);const n=this.connection.peerConnection,s=this.connection.provider;Pe.log("Setting remote description",t);const r=this;try{await n.setRemoteDescription(t),Pe.log(`Set remoteDescription:${e} for:${this.connection.peer}`),e==="OFFER"&&await r._makeAnswer()}catch(o){s.emitError(Ut.WebRTC,o),Pe.log("Failed to setRemoteDescription, ",o)}}async handleCandidate(e){Pe.log("handleCandidate:",e);try{await this.connection.peerConnection.addIceCandidate(e),Pe.log(`Added ICE candidate for:${this.connection.peer}`)}catch(t){this.connection.provider.emitError(Ut.WebRTC,t),Pe.log("Failed to handleCandidate, ",t)}}_addTracksToConnection(e,t){if(Pe.log(`add tracks from stream ${e.id} to peer connection`),!t.addTrack)return Pe.error("Your browser does't support RTCPeerConnection#addTrack. Ignored.");e.getTracks().forEach(n=>{t.addTrack(n,e)})}_addStreamToMediaConnection(e,t){Pe.log(`add stream ${e.id} to media connection ${t.connectionId}`),t.addStream(e)}}class Ud extends Wl.EventEmitter{emitError(e,t){Pe.error("Error:",t),this.emit("error",new ZM(`${e}`,t))}}class ZM extends Error{constructor(e,t){typeof t=="string"?super(t):(super(),Object.assign(this,t)),this.type=e}}class Nd extends Ud{get open(){return this._open}constructor(e,t,n){super(),this.peer=e,this.provider=t,this.options=n,this._open=!1,this.metadata=n.metadata}}var ml;const Dr=class Dr extends Nd{get type(){return Ci.Media}get localStream(){return this._localStream}get remoteStream(){return this._remoteStream}constructor(e,t,n){super(e,t,n),this._localStream=this.options._stream,this.connectionId=this.options.connectionId||Dr.ID_PREFIX+hn.randomToken(),this._negotiator=new Ld(this),this._localStream&&this._negotiator.startConnection({_stream:this._localStream,originator:!0})}_initializeDataChannel(e){this.dataChannel=e,this.dataChannel.onopen=()=>{Pe.log(`DC#${this.connectionId} dc connection success`),this.emit("willCloseOnRemote")},this.dataChannel.onclose=()=>{Pe.log(`DC#${this.connectionId} dc closed for:`,this.peer),this.close()}}addStream(e){Pe.log("Receiving stream",e),this._remoteStream=e,super.emit("stream",e)}handleMessage(e){const t=e.type,n=e.payload;switch(e.type){case jt.Answer:this._negotiator.handleSDP(t,n.sdp),this._open=!0;break;case jt.Candidate:this._negotiator.handleCandidate(n.candidate);break;default:Pe.warn(`Unrecognized message type:${t} from peer:${this.peer}`);break}}answer(e,t={}){if(this._localStream){Pe.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");return}this._localStream=e,t&&t.sdpTransform&&(this.options.sdpTransform=t.sdpTransform),this._negotiator.startConnection({...this.options._payload,_stream:e});const n=this.provider._getMessages(this.connectionId);for(const s of n)this.handleMessage(s);this._open=!0}close(){this._negotiator&&(this._negotiator.cleanup(),this._negotiator=null),this._localStream=null,this._remoteStream=null,this.provider&&(this.provider._removeConnection(this),this.provider=null),this.options&&this.options._stream&&(this.options._stream=null),this.open&&(this._open=!1,super.emit("close"))}};ml=new WeakMap,ar(Dr,ml,Dr.ID_PREFIX="mc_");let na=Dr;class JM{constructor(e){this._options=e}_buildRequest(e){const t=this._options.secure?"https":"http",{host:n,port:s,path:r,key:o}=this._options,a=new URL(`${t}://${n}:${s}${r}${o}/${e}`);return a.searchParams.set("ts",`${Date.now()}${Math.random()}`),a.searchParams.set("version",Id),fetch(a.href,{referrerPolicy:this._options.referrerPolicy})}async retrieveId(){try{const e=await this._buildRequest("id");if(e.status!==200)throw new Error(`Error. Status:${e.status}`);return e.text()}catch(e){Pe.error("Error retrieving ID",e);let t="";throw this._options.path==="/"&&this._options.host!==hn.CLOUD_HOST&&(t=" If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."),new Error("Could not get an ID from the server."+t)}}async listAllPeers(){try{const e=await this._buildRequest("peers");if(e.status!==200){if(e.status===401){let t="";throw this._options.host===hn.CLOUD_HOST?t="It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.":t="You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.",new Error("It doesn't look like you have permission to list peers IDs. "+t)}throw new Error(`Error. Status:${e.status}`)}return e.json()}catch(e){throw Pe.error("Error retrieving list peers",e),new Error("Could not get list peers from the server."+e)}}}var gl,_l;const Yi=class Yi extends Nd{get type(){return Ci.Data}constructor(e,t,n){super(e,t,n),this.connectionId=this.options.connectionId||Yi.ID_PREFIX+Pd(),this.label=this.options.label||this.connectionId,this.reliable=!!this.options.reliable,this._negotiator=new Ld(this),this._negotiator.startConnection(this.options._payload||{originator:!0,reliable:this.reliable})}_initializeDataChannel(e){this.dataChannel=e,this.dataChannel.onopen=()=>{Pe.log(`DC#${this.connectionId} dc connection success`),this._open=!0,this.emit("open")},this.dataChannel.onmessage=t=>{Pe.log(`DC#${this.connectionId} dc onmessage:`,t.data)},this.dataChannel.onclose=()=>{Pe.log(`DC#${this.connectionId} dc closed for:`,this.peer),this.close()}}close(e){if(e?.flush){this.send({__peerData:{type:"close"}});return}this._negotiator&&(this._negotiator.cleanup(),this._negotiator=null),this.provider&&(this.provider._removeConnection(this),this.provider=null),this.dataChannel&&(this.dataChannel.onopen=null,this.dataChannel.onmessage=null,this.dataChannel.onclose=null,this.dataChannel=null),this.open&&(this._open=!1,super.emit("close"))}send(e,t=!1){if(!this.open){this.emitError(Xl.NotOpenYet,"Connection is not open. You should listen for the `open` event before sending messages.");return}return this._send(e,t)}async handleMessage(e){const t=e.payload;switch(e.type){case jt.Answer:await this._negotiator.handleSDP(e.type,t.sdp);break;case jt.Candidate:await this._negotiator.handleCandidate(t.candidate);break;default:Pe.warn("Unrecognized message type:",e.type,"from peer:",this.peer);break}}};gl=new WeakMap,_l=new WeakMap,ar(Yi,gl,Yi.ID_PREFIX="dc_"),ar(Yi,_l,Yi.MAX_BUFFERED_AMOUNT=8388608);let ia=Yi;class $l extends ia{get bufferSize(){return this._bufferSize}_initializeDataChannel(e){super._initializeDataChannel(e),this.dataChannel.binaryType="arraybuffer",this.dataChannel.addEventListener("message",t=>this._handleDataMessage(t))}_bufferedSend(e){(this._buffering||!this._trySend(e))&&(this._buffer.push(e),this._bufferSize=this._buffer.length)}_trySend(e){if(!this.open)return!1;if(this.dataChannel.bufferedAmount>ia.MAX_BUFFERED_AMOUNT)return this._buffering=!0,setTimeout(()=>{this._buffering=!1,this._tryBuffer()},50),!1;try{this.dataChannel.send(e)}catch(t){return Pe.error(`DC#:${this.connectionId} Error when sending:`,t),this._buffering=!0,this.close(),!1}return!0}_tryBuffer(){if(!this.open||this._buffer.length===0)return;const e=this._buffer[0];this._trySend(e)&&(this._buffer.shift(),this._bufferSize=this._buffer.length,this._tryBuffer())}close(e){if(e?.flush){this.send({__peerData:{type:"close"}});return}this._buffer=[],this._bufferSize=0,super.close()}constructor(...e){super(...e),this._buffer=[],this._bufferSize=0,this._buffering=!1}}class ec extends $l{close(e){super.close(e),this._chunkedData={}}constructor(e,t,n){super(e,t,n),this.chunker=new Rd,this.serialization=fa.Binary,this._chunkedData={}}_handleDataMessage({data:e}){const t=jf(e),n=t.__peerData;if(n){if(n.type==="close"){this.close();return}this._handleChunk(t);return}this.emit("data",t)}_handleChunk(e){const t=e.__peerData,n=this._chunkedData[t]||{data:[],count:0,total:e.total};if(n.data[e.n]=new Uint8Array(e.data),n.count++,this._chunkedData[t]=n,n.total===n.count){delete this._chunkedData[t];const s=VM(n.data);this._handleDataMessage({data:s})}}_send(e,t){const n=Kf(e);if(n instanceof Promise)return this._send_blob(n);if(!t&&n.byteLength>this.chunker.chunkedMTU){this._sendChunks(n);return}this._bufferedSend(n)}async _send_blob(e){const t=await e;if(t.byteLength>this.chunker.chunkedMTU){this._sendChunks(t);return}this._bufferedSend(t)}_sendChunks(e){const t=this.chunker.chunk(e);Pe.log(`DC#${this.connectionId} Try to send ${t.length} chunks...`);for(const n of t)this.send(n,!0)}}class QM extends $l{_handleDataMessage({data:e}){super.emit("data",e)}_send(e,t){this._bufferedSend(e)}constructor(...e){super(...e),this.serialization=fa.None}}class eS extends $l{_handleDataMessage({data:e}){const t=this.parse(this.decoder.decode(e)),n=t.__peerData;if(n&&n.type==="close"){this.close();return}this.emit("data",t)}_send(e,t){const n=this.encoder.encode(this.stringify(e));if(n.byteLength>=hn.chunkedMTU){this.emitError(Xl.MessageToBig,"Message too big for JSON channel");return}this._bufferedSend(n)}constructor(...e){super(...e),this.serialization=fa.JSON,this.encoder=new TextEncoder,this.decoder=new TextDecoder,this.stringify=JSON.stringify,this.parse=JSON.parse}}var vl;const Ir=class Ir extends Ud{get id(){return this._id}get options(){return this._options}get open(){return this._open}get socket(){return this._socket}get connections(){const e=Object.create(null);for(const[t,n]of this._connections)e[t]=n;return e}get destroyed(){return this._destroyed}get disconnected(){return this._disconnected}constructor(e,t){super(),this._serializers={raw:QM,json:eS,binary:ec,"binary-utf8":ec,default:ec},this._id=null,this._lastServerId=null,this._destroyed=!1,this._disconnected=!1,this._open=!1,this._connections=new Map,this._lostMessages=new Map;let n;if(e&&e.constructor==Object?t=e:e&&(n=e.toString()),t={debug:0,host:hn.CLOUD_HOST,port:hn.CLOUD_PORT,path:"/",key:Ir.DEFAULT_KEY,token:hn.randomToken(),config:hn.defaultConfig,referrerPolicy:"strict-origin-when-cross-origin",serializers:{},...t},this._options=t,this._serializers={...this._serializers,...this.options.serializers},this._options.host==="/"&&(this._options.host=window.location.hostname),this._options.path&&(this._options.path[0]!=="/"&&(this._options.path="/"+this._options.path),this._options.path[this._options.path.length-1]!=="/"&&(this._options.path+="/")),this._options.secure===void 0&&this._options.host!==hn.CLOUD_HOST?this._options.secure=hn.isSecure():this._options.host==hn.CLOUD_HOST&&(this._options.secure=!0),this._options.logFunction&&Pe.setLogFunction(this._options.logFunction),Pe.logLevel=this._options.debug||0,this._api=new JM(t),this._socket=this._createServerConnection(),!hn.supports.audioVideo&&!hn.supports.data){this._delayedAbort(Ut.BrowserIncompatible,"The current browser does not support WebRTC");return}if(n&&!hn.validateId(n)){this._delayedAbort(Ut.InvalidID,`ID "${n}" is invalid`);return}n?this._initialize(n):this._api.retrieveId().then(s=>this._initialize(s)).catch(s=>this._abort(Ut.ServerError,s))}_createServerConnection(){const e=new KM(this._options.secure,this._options.host,this._options.port,this._options.path,this._options.key,this._options.pingInterval);return e.on(bi.Message,t=>{this._handleMessage(t)}),e.on(bi.Error,t=>{this._abort(Ut.SocketError,t)}),e.on(bi.Disconnected,()=>{this.disconnected||(this.emitError(Ut.Network,"Lost connection to server."),this.disconnect())}),e.on(bi.Close,()=>{this.disconnected||this._abort(Ut.SocketClosed,"Underlying socket is already closed.")}),e}_initialize(e){this._id=e,this.socket.start(e,this._options.token)}_handleMessage(e){const t=e.type,n=e.payload,s=e.src;switch(t){case jt.Open:this._lastServerId=this.id,this._open=!0,this.emit("open",this.id);break;case jt.Error:this._abort(Ut.ServerError,n.msg);break;case jt.IdTaken:this._abort(Ut.UnavailableID,`ID "${this.id}" is taken`);break;case jt.InvalidKey:this._abort(Ut.InvalidKey,`API KEY "${this._options.key}" is invalid`);break;case jt.Leave:Pe.log(`Received leave message from ${s}`),this._cleanupPeer(s),this._connections.delete(s);break;case jt.Expire:this.emitError(Ut.PeerUnavailable,`Could not connect to peer ${s}`);break;case jt.Offer:{const r=n.connectionId;let o=this.getConnection(s,r);if(o&&(o.close(),Pe.warn(`Offer received for existing Connection ID:${r}`)),n.type===Ci.Media){const c=new na(s,this,{connectionId:r,_payload:n,metadata:n.metadata});o=c,this._addConnection(s,o),this.emit("call",c)}else if(n.type===Ci.Data){const c=new this._serializers[n.serialization](s,this,{connectionId:r,_payload:n,metadata:n.metadata,label:n.label,serialization:n.serialization,reliable:n.reliable});o=c,this._addConnection(s,o),this.emit("connection",c)}else{Pe.warn(`Received malformed connection type:${n.type}`);return}const a=this._getMessages(r);for(const c of a)o.handleMessage(c);break}default:{if(!n){Pe.warn(`You received a malformed message from ${s} of type ${t}`);return}const r=n.connectionId,o=this.getConnection(s,r);o&&o.peerConnection?o.handleMessage(e):r?this._storeMessage(r,e):Pe.warn("You received an unrecognized message:",e);break}}}_storeMessage(e,t){this._lostMessages.has(e)||this._lostMessages.set(e,[]),this._lostMessages.get(e).push(t)}_getMessages(e){const t=this._lostMessages.get(e);return t?(this._lostMessages.delete(e),t):[]}connect(e,t={}){if(t={serialization:"default",...t},this.disconnected){Pe.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available."),this.emitError(Ut.Disconnected,"Cannot connect to new Peer after disconnecting from server.");return}const n=new this._serializers[t.serialization](e,this,t);return this._addConnection(e,n),n}call(e,t,n={}){if(this.disconnected){Pe.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect."),this.emitError(Ut.Disconnected,"Cannot connect to new Peer after disconnecting from server.");return}if(!t){Pe.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");return}const s=new na(e,this,{...n,_stream:t});return this._addConnection(e,s),s}_addConnection(e,t){Pe.log(`add connection ${t.type}:${t.connectionId} to peerId:${e}`),this._connections.has(e)||this._connections.set(e,[]),this._connections.get(e).push(t)}_removeConnection(e){const t=this._connections.get(e.peer);if(t){const n=t.indexOf(e);n!==-1&&t.splice(n,1)}this._lostMessages.delete(e.connectionId)}getConnection(e,t){const n=this._connections.get(e);if(!n)return null;for(const s of n)if(s.connectionId===t)return s;return null}_delayedAbort(e,t){setTimeout(()=>{this._abort(e,t)},0)}_abort(e,t){Pe.error("Aborting!"),this.emitError(e,t),this._lastServerId?this.disconnect():this.destroy()}destroy(){this.destroyed||(Pe.log(`Destroy peer with ID:${this.id}`),this.disconnect(),this._cleanup(),this._destroyed=!0,this.emit("close"))}_cleanup(){for(const e of this._connections.keys())this._cleanupPeer(e),this._connections.delete(e);this.socket.removeAllListeners()}_cleanupPeer(e){const t=this._connections.get(e);if(t)for(const n of t)n.close()}disconnect(){if(this.disconnected)return;const e=this.id;Pe.log(`Disconnect peer with ID:${e}`),this._disconnected=!0,this._open=!1,this.socket.close(),this._lastServerId=e,this._id=null,this.emit("disconnected",e)}reconnect(){if(this.disconnected&&!this.destroyed)Pe.log(`Attempting reconnection to server with ID ${this._lastServerId}`),this._disconnected=!1,this._initialize(this._lastServerId);else{if(this.destroyed)throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");if(!this.disconnected&&!this.open)Pe.error("In a hurry? We're still trying to make the initial connection!");else throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`)}}listAllPeers(e=t=>{}){this._api.listAllPeers().then(t=>e(t)).catch(t=>this._abort(Ut.ServerError,t))}};vl=new WeakMap,ar(Ir,vl,Ir.DEFAULT_KEY="peerjs");let cl=Ir;var Od=cl;function tS(i,e=!1){const t=new vt;t.name=`veteran_${i}`;const n=new ue({color:13210988,roughness:.85}),s=new ue({color:10514496,roughness:.9}),r=new ue({color:1118481,roughness:1}),o=new ue({color:2968094,roughness:.8}),a=new ue({color:13373713,roughness:.5,metalness:.3}),c=new ue({color:2763306,roughness:.7,metalness:.1}),l=new ue({color:3811866,roughness:.9}),h=new ue({color:1710618,roughness:.6,metalness:.4}),u=new ue({color:13369344,roughness:.7}),f=new ue({color:16777215,roughness:.7}),d=new ue({color:9109504,roughness:.7}),g=document.createElement("canvas");g.width=64,g.height=64;const v=g.getContext("2d");v.fillStyle="#4a5c3a",v.fillRect(0,0,64,64);const m=["#3d4f2e","#6b7c55","#2f3b20","#5a6b45","#485a36"];for(let ge=0;ge<80;ge++)v.fillStyle=m[Math.floor(Math.random()*m.length)],v.fillRect(Math.random()*64,Math.random()*64,2+Math.random()*10,2+Math.random()*7);const p=new ns(g);p.wrapS=p.wrapT=mi;const E=new ue({map:p,roughness:.85}),y=new vt;t.add(y),[-.14,.14].forEach(ge=>{const re=new H(new Fe(.18,.24,.26),l);re.position.set(ge,.12,0),re.castShadow=!0,y.add(re)});const x=new Fe(.18,.52,.2),D=new Fe(.18,.52,.2),R=new H(x,E),A=new H(D,E);R.position.set(-.14,.62,0),R.castShadow=!0,A.position.set(.14,.62,0),A.castShadow=!0,R.name="lLeg",A.name="rLeg",y.add(R),y.add(A);const I=new H(new Fe(1.1,.7,.5),E);I.position.set(0,1.15,0),I.castShadow=!0,y.add(I);const T=new H(new Fe(.85,.55,.28),c);T.position.set(0,1.18,.12),y.add(T);const M=new H(new Fe(.12,.08,.02),a);M.position.set(0,1.25,.27),y.add(M);const L=new vt;L.position.set(-.56,1.32,0),L.rotation.z=Math.PI/2;const V=new H(new Fe(.16,.02,.1),u),G=new H(new Fe(.08,.025,.1),f),j=new H(new Fe(.04,.02,.08),u);G.position.x=0,j.position.x=0,L.add(V),L.add(G),L.add(j),y.add(L);const U=new H(new Fe(.02,.1,.16),d);U.position.set(.56,1.32,0),y.add(U);const F=new Fe(.15,.52,.15),W=new Fe(.15,.52,.15);F.translate(0,-.26,0),W.translate(0,-.26,0);const N=new H(F,E),oe=new H(W,E);N.position.set(-.625,1.48,0),oe.position.set(.625,1.48,0),N.rotation.x=.18,oe.rotation.x=-.25,N.castShadow=!0,oe.castShadow=!0,N.name="lArm",oe.name="rArm",y.add(N),y.add(oe);const fe=new H(new mt(.28,10,8),n);fe.position.set(0,1.78,0),fe.castShadow=!0,y.add(fe);const ve=new H(new Fe(.22,.08,.2),s);ve.position.set(0,1.63,.04),y.add(ve),[-.09,.09].forEach(ge=>{const re=new H(new mt(.035,6,6),r);re.position.set(ge,1.8,.24),y.add(re)});const De=new H(new Xe(.27,.22,.08,12),o);De.position.set(.04,2,0),De.rotation.z=-.15,y.add(De);const $e=new H(new Di(.055,8),a);$e.position.set(0,2.05,.22),$e.rotation.x=-.3,y.add($e);const Y=new vt;Y.position.set(.38,1.18,-.22),Y.rotation.x=.1;const ce=new H(new Fe(.05,.06,.32),h);ce.position.set(0,0,.16);const be=new H(new Fe(.05,.08,.52),h),pe=new H(new Xe(.015,.015,.42,6),h);pe.rotation.x=Math.PI/2,pe.position.set(0,.03,-.38);const Ie=new H(new Fe(.04,.14,.05),h);Ie.position.set(0,-.1,-.05),Y.add(ce),Y.add(be),Y.add(pe),Y.add(Ie),y.add(Y);const ze=new vt;ze.name="billboard",ze.position.set(0,2.5,0);const Ue=new Di(.22,16),He=new nt({color:3381759,transparent:!0,opacity:.55,depthWrite:!1,side:Mt}),Je=new H(Ue,He);Je.position.set(0,.3,0),ze.add(Je);const Le=document.createElement("canvas");Le.width=256,Le.height=64;const w=Le.getContext("2d");w.fillStyle="rgba(0,0,0,0.65)",nS(w,0,0,256,64,8),w.fill(),w.fillStyle="#ffffff",w.font='bold 26px "Courier New", monospace',w.textAlign="center",w.textBaseline="middle",w.fillText(i,128,32);const de=new ns(Le),se=new Kt(1.1,.28),le=new nt({map:de,transparent:!0,depthWrite:!1,side:Mt}),J=new H(se,le);return J.position.set(0,0,0),ze.add(J),t.add(ze),e&&(y.visible=!1,ze.visible=!1),t.userData.limbs={lArm:N,rArm:oe,lLeg:R,rLeg:A},t}function nS(i,e,t,n,s,r){i.beginPath(),i.moveTo(e+r,t),i.lineTo(e+n-r,t),i.quadraticCurveTo(e+n,t,e+n,t+r),i.lineTo(e+n,t+s-r),i.quadraticCurveTo(e+n,t+s,e+n-r,t+s),i.lineTo(e+r,t+s),i.quadraticCurveTo(e,t+s,e,t+s-r),i.lineTo(e,t+r),i.quadraticCurveTo(e,t,e+r,t),i.closePath()}let Xn=null,Cn=null,Ar=[],sr=!1,rn=null,sa=null,Ii=null;const fn=new Map;let Ai=new Map,iS=0,On=0,Zs=!1;const Vt=new Map;function Fd(i,e,t){return Ii=i,Xn}function sS(){const i=Math.random().toString(36).substring(2,8).toUpperCase(),e=i.toLowerCase();return Xn=new Od(e,{debug:0}),sr=!0,Xn.on("open",t=>{rn=t,sa="Veteran-"+(Math.floor(Math.random()*9e3)+1e3),_.networkMode=!0,Vt.set(rn,{id:rn,name:sa,pos:{x:0,y:1.7,z:0},rotY:0,health:100,alive:!0}),ui(Vt.size),nc()}),Xn.on("connection",t=>{t.on("open",()=>{Ar.push(t);const n=[];Ai.forEach(o=>{o.dead||n.push({id:o.id,type:o.type,x:o.x,z:o.z,hp:o.hp,maxHp:o.maxHp,speed:o.speed,damage:o.damage,score:o.score||10})});const s=[];Vt.forEach(o=>s.push(o)),rr(t,{type:"init",yourName:"Veteran-"+(Math.floor(Math.random()*9e3)+1e3),players:s,enemies:n,wave:On,waveActive:Zs});const r="Veteran-"+(Math.floor(Math.random()*9e3)+1e3);Vt.set(t.peer,{id:t.peer,name:r,pos:{x:0,y:1.7,z:0},rotY:0,health:100,alive:!0}),ra({type:"player_joined",id:t.peer,name:r},t.peer),ui(Vt.size),nc(),t.on("data",o=>aS(t,Wd(o))),t.on("close",()=>{const o=Ar.indexOf(t);o!==-1&&Ar.splice(o,1);const a=Vt.get(t.peer);Vt.delete(t.peer),Xd(t.peer),a&&ra({type:"player_left",id:t.peer,name:a.name}),ui(Vt.size),nc()}),t.on("error",o=>console.warn("[Net] guest conn error",o))})}),Xn.on("error",t=>{console.error("[Net] peer error",t);const n=document.getElementById("lobby-error");n&&(n.style.display="block",n.textContent="PEER ERROR: "+t.type)}),setInterval(lS,50),setInterval(hS,50),setInterval(uS,1e3),setTimeout(()=>{_.started&&ql()},3e3),i}function rS(i){sr=!1;const e=i.toLowerCase();Xn?Nu(e):(Xn=new Od({debug:0}),Xn.on("open",t=>{rn=t,sa="Veteran-"+(Math.floor(Math.random()*9e3)+1e3),Nu(e)}),Xn.on("error",t=>{console.error("[Net] peer error",t),ll("PEER ERROR: "+t.type)}))}function Nu(i){const e=Xn.connect(i,{reliable:!0});Cn=e;const t=document.getElementById("lobby-connecting");t&&(t.style.display="block"),e.on("open",()=>{_.networkMode=!0,ui(2),rr(e,{type:"player_move",pos:{x:0,y:1.7,z:0},rotY:0})}),e.on("data",n=>cS(Wd(n))),e.on("close",()=>{_.networkMode=!1,st("DISCONNECTED FROM HOST"),fn.forEach((n,s)=>{Ii.remove(n.mesh)}),fn.clear(),ui(1)}),e.on("error",n=>{console.error("[Net] host conn error",n),ll("CONNECTION FAILED: "+n.type)}),setTimeout(()=>{e.open||ll("CONNECTION TIMED OUT — CHECK ROOM CODE")},1e4)}function zd(i,e){if(sr){const t=Vt.get(rn);t&&(t.pos={x:i.x,y:i.y,z:i.z},t.rotY=e.y)}else Cn&&Cn.open&&rr(Cn,{type:"player_move",pos:{x:i.x,y:i.y,z:i.z},rotY:e.y})}function Bd(i,e){sr?Vd(rn,i,e):Cn&&Cn.open&&rr(Cn,{type:"kill_enemy",enemyId:i,damage:e})}function oS(i){}function kd(){return sr?_.networkMode&&Ar.length>0:!!(Cn&&Cn.open)}function Hd(){sr&&!Zs&&On===0&&setTimeout(()=>ql(),3e3)}function Gd(i){const e=new P;i.getWorldPosition(e),fn.forEach(t=>{if(!t.mesh)return;t.targetPos&&t.mesh.position.lerp(t.targetPos,.2),t.targetRot!==void 0&&(t.mesh.rotation.y=ut.lerp(t.mesh.rotation.y,t.targetRot,.2));const n=t.mesh.getObjectByName("nametag");n&&n.lookAt(e),t.walkTime=(t.walkTime||0)+.06;const s=t.mesh.userData?.limbs;if(s){const r=Math.sin(t.walkTime*4)*.6;s.lLeg&&(s.lLeg.rotation.x=r),s.rLeg&&(s.rLeg.rotation.x=-r),s.lArm&&(s.lArm.rotation.x=-r*.5),s.rArm&&(s.rArm.rotation.x=r*.5)}})}function aS(i,e){if(e)switch(e.type){case"player_move":{const t=Vt.get(i.peer);t&&(t.pos=e.pos,t.rotY=e.rotY);const n=fn.get(i.peer);n&&(n.targetPos=new P(e.pos.x,e.pos.y,e.pos.z),n.targetRot=e.rotY);break}case"kill_enemy":{Vd(i.peer,e.enemyId,e.damage);break}case"request_respawn":{const t=Vt.get(i.peer);t&&setTimeout(()=>{if(!Vt.has(i.peer))return;t.health=100,t.alive=!0;const n=dS();t.pos=n,ss({type:"player_respawned",id:i.peer,pos:n})},1e4);break}}}function cS(i){if(i)switch(i.type){case"init":{sa=i.yourName,i.players.forEach(t=>{t.id!==rn&&tc(t.id,t.name,t.pos||{x:0,y:1.7,z:0})}),i.waveActive&&i.enemies.length>0&&(i.enemies.forEach(t=>{if(!_.enemies.find(n=>n.netId===t.id)){const n=jc(t.type,t.x,t.z,t.id);n&&(n.hp=t.hp,n.maxHp=t.maxHp||t.hp)}}),_.wave=i.wave,_.waveActive=!0),ui(i.players.length+1);const e=document.getElementById("lobby");e&&(e.style.display="none"),window._lobbyStartGameFn&&window._lobbyStartGameFn();break}case"players_update":{i.players.forEach(e=>{if(e.id===rn)return;const t=fn.get(e.id);t?(t.targetPos=new P(e.pos.x,e.pos.y,e.pos.z),t.targetRot=e.rotY,t.health=e.health,t.alive=e.alive):tc(e.id,e.name,e.pos)}),ui(i.players.length);break}case"enemy_state":{if(!_.started)return;i.enemies.forEach(e=>{const t=_.enemies.find(n=>n.netId===e.id);t&&(t.targetX=e.x,t.targetZ=e.z,t.hp=e.hp,t.serverRotation=e.rot)});break}case"wave_start":{if(!_.started)return;for(let e=_.enemies.length-1;e>=0;e--){const t=_.enemies[e];t.netId&&(t.mesh&&Ii.remove(t.mesh),_.enemies.splice(e,1))}_.wave=i.wave,_.waveActive=!0,st(`WAVE ${i.wave} — ${i.enemies.length} HOSTILES INBOUND`),i.enemies.forEach(e=>{const t=jc(e.type,e.x,e.z,e.id);t&&(t.hp=e.hp,t.maxHp=e.hp)});break}case"wave_complete":{if(!_.started)return;_.waveActive=!1,st(`WAVE ${i.wave} CLEARED — STAND BY`);const e=document.getElementById("resupplyBanner");e&&(e.style.display="block",setTimeout(()=>{e.style.display="none"},2e3));break}case"enemy_killed":{const e=_.enemies.find(t=>t.netId===i.id);e&&!e.dead&&(e.hp=0,e.dead=!0),i.killerName&&st(`${i.killerName} ELIMINATED A COMMUNIST`);break}case"player_damaged":{i.targetId===rn&&_.alive&&(_.health=Math.max(0,_.health-i.amount),_.damageFlashTime=.3);break}case"player_died":{i.id===rn?(_.alive=!1,qd(10),Cn&&Cn.open&&rr(Cn,{type:"request_respawn"})):$d(i.id);break}case"player_respawned":{if(i.id===rn)_.health=100,_.alive=!0,_.pendingRespawn=new P(i.pos.x,i.pos.y,i.pos.z),Yl();else{const e=fn.get(i.id);e&&(e.alive=!0,e.mesh.rotation.z=0,e.mesh.visible=!0,e.targetPos=new P(i.pos.x,i.pos.y,i.pos.z))}break}case"player_joined":{i.id!==rn&&(tc(i.id,i.name,{x:0,y:1.7,z:0}),st(`${i.name} JOINED THE FIGHT`),ui(fn.size+1));break}case"player_left":{Xd(i.id),i.name&&st(`${i.name} HAS LEFT THE FIELD`),ui(fn.size+1);break}}}function lS(){if(!_.started||!Zs)return;const i=performance.now(),e=1/20;Ai.forEach(n=>{if(n.dead)return;let s=1/0,r=null,o=null;if(Vt.forEach((h,u)=>{if(!h.alive)return;const f=(h.pos?.x||0)-n.x,d=(h.pos?.z||0)-n.z,g=Math.sqrt(f*f+d*d);g<s&&(s=g,r=h.pos,o=u)}),!r)return;const a=r.x-n.x,c=r.z-n.z,l=Math.sqrt(a*a+c*c)||1;if(n.x+=a/l*n.speed*e,n.z+=c/l*n.speed*e,n.rotation=Math.atan2(a,c),l<3&&i-(n.lastHit||0)>1200){n.lastHit=i;const u=Vt.get(o);u&&u.alive&&(u.health=Math.max(0,u.health-n.damage),ss({type:"player_damaged",targetId:o,amount:n.damage}),u.health<=0&&u.alive&&(u.alive=!1,ss({type:"player_died",id:o})))}});const t=[];Ai.forEach(n=>{if(!n.dead){t.push({id:n.id,x:n.x,z:n.z,rot:n.rotation,hp:n.hp});const s=_.enemies.find(r=>r.netId===n.id);s&&(s.targetX=n.x,s.targetZ=n.z,s.serverRotation=n.rotation)}}),t.length>0&&ra({type:"enemy_state",enemies:t},null)}function hS(){_.started&&ss({type:"players_update",players:fS()})}function uS(){if(!Zs)return;let i=!0;Ai.forEach(e=>{e.dead||(i=!1)}),i&&Ai.size>0&&(Zs=!1,_.waveActive=!1,ss({type:"wave_complete",wave:On}),Ai.clear(),setTimeout(()=>{_.started&&ql()},5e3))}function ql(){if(!_.started)return;On++,Zs=!0,_.wave=On,_.waveActive=!0;const i=Vt.size;let e=8+On*4;i>1&&(e=Math.floor(e*Math.pow(1.3,i-1)));const t=On>=3?Math.floor(On*.5):0,n=On>=2?Math.floor(On*.4):0,s=Math.max(1,e-t-n),r={grunt:{hp:40,speed:2.5,damage:12,score:10},heavy:{hp:100,speed:1.6,damage:25,score:30},ranger:{hp:25,speed:3.5,damage:8,score:20}},o=[],a=(c,l)=>{const h=r[c];for(let u=0;u<l;u++){const f=Math.random()*Math.PI*2,d=80+Math.random()*70,g=Math.cos(f)*d,v=Math.sin(f)*d,m="e_"+ ++iS,p={id:m,type:c,x:g,z:v,hp:h.hp,maxHp:h.hp,speed:h.speed,damage:h.damage,score:h.score,dead:!1,lastHit:0,rotation:0};Ai.set(m,p),o.push({id:m,type:c,x:g,z:v,hp:h.hp,maxHp:h.hp,speed:h.speed,damage:h.damage,score:h.score})}};if(a("grunt",s),a("heavy",t),a("ranger",n),ss({type:"wave_start",wave:On,enemies:o}),_.started){for(let c=_.enemies.length-1;c>=0;c--){const l=_.enemies[c];l.netId&&(l.mesh&&Ii.remove(l.mesh),_.enemies.splice(c,1))}o.forEach(c=>{const l=jc(c.type,c.x,c.z,c.id);l&&(l.hp=c.hp,l.maxHp=c.hp)})}}function Vd(i,e,t){const n=Ai.get(e);if(!(!n||n.dead)&&(n.hp-=t,n.hp<=0)){n.dead=!0;const s=Vt.get(i),r=s?s.name:"UNKNOWN";ss({type:"enemy_killed",id:e,killerName:r})}}function rr(i,e){if(i&&i.open)try{i.send(JSON.stringify(e))}catch{}}function Wd(i){try{return typeof i=="string"?JSON.parse(i):i}catch{return null}}function ra(i,e){Ar.forEach(t=>{t.peer!==e&&rr(t,i)})}function ss(i){switch(ra(i,null),i.type){case"player_damaged":i.targetId===rn&&_.alive&&(_.health=Math.max(0,_.health-i.amount),_.damageFlashTime=.3);break;case"player_died":i.id===rn?(_.alive=!1,qd(10)):$d(i.id);break;case"player_respawned":if(i.id===rn)_.health=100,_.alive=!0,_.pendingRespawn=new P(i.pos.x,i.pos.y,i.pos.z),Yl();else{const e=fn.get(i.id);e&&(e.alive=!0,e.mesh.rotation.z=0,e.mesh.visible=!0,e.targetPos=new P(i.pos.x,i.pos.y,i.pos.z))}break;case"enemy_killed":{const e=_.enemies.find(t=>t.netId===i.id);e&&!e.dead&&(e.hp=0,e.dead=!0),i.killerName&&st(`${i.killerName} ELIMINATED A COMMUNIST`);break}case"wave_complete":_.waveActive=!1,st(`WAVE ${i.wave} CLEARED — STAND BY`);break}}function fS(){const i=[];return Vt.forEach(e=>i.push({id:e.id,name:e.name,pos:e.pos,rotY:e.rotY,health:e.health,alive:e.alive})),i}function tc(i,e,t){if(!Ii||fn.has(i))return;const n=tS(e,!1),s=t||{x:0,y:1.7,z:0};n.position.set(s.x,s.y,s.z),Ii.add(n),fn.set(i,{mesh:n,name:e,health:100,alive:!0,targetPos:new P(s.x,s.y,s.z),targetRot:0,walkTime:0})}function Xd(i){const e=fn.get(i);!e||!Ii||(Ii.remove(e.mesh),e.mesh.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material.forEach(n=>n.dispose()):t.material.dispose())}),fn.delete(i))}function $d(i){const e=fn.get(i);e&&(e.alive=!1,e.mesh.rotation.z=Math.PI/2,e.mesh.position.y=.3)}function dS(){return{x:(Math.random()-.5)*20+12,y:1.7,z:(Math.random()-.5)*20+12}}let Rr=null;function qd(i){const e=document.getElementById("respawn-timer");if(!e)return;e.style.display="block";let t=i;e.textContent=`RESPAWNING IN ${t}...`,Rr=setInterval(()=>{t--,e&&(e.textContent=`RESPAWNING IN ${t}...`),t<=0&&(clearInterval(Rr),Yl())},1e3)}function Yl(){Rr&&(clearInterval(Rr),Rr=null);const i=document.getElementById("respawn-timer");i&&(i.style.display="none")}function ui(i){const e=document.getElementById("player-count");e&&(e.textContent=`PLAYERS: ${i}`)}function nc(){const i=document.getElementById("lobby-player-list");if(!i)return;const e=[];Vt.forEach(t=>e.push(t.name)),i.textContent=e.join(" | ")||"Waiting..."}function ll(i){const e=document.getElementById("lobby-error");e&&(e.style.display="block",e.textContent=i);const t=document.getElementById("lobby-connecting");t&&(t.style.display="none")}const pS=Object.freeze(Object.defineProperty({__proto__:null,hostGame:sS,initNetwork:Fd,isConnected:kd,joinGame:rS,notifyGameReady:Hd,sendDamage:oS,sendKill:Bd,sendPosition:zd,updateRemotePlayerBillboards:Gd},Symbol.toStringTag,{value:"Module"})),mS={uniforms:{tDiffuse:{value:null},amount:{value:.9},time:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      float dist = length(c);
      float distortion = 1.0 + dist * dist * amount;
      vec2 uv = c * distortion + 0.5;
      float r = texture2D(tDiffuse, uv + vec2(0.005 * dist, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(0.005 * dist, 0.0)).b;
      float vignette = smoothstep(1.3, 0.3, dist * 1.5);
      gl_FragColor = vec4(vec3(r, g, b) * vignette, 1.0);
    }
  `};let sn,Ye,yt,Nt,Rs,Gs,Us,hl,En,ul,fl,dl,Ou,St,Fu=performance.now(),zu=0,ic=0;const gS=20;let Vs=0,Yd=0,Js=0,da=0,jl=0,Kl=!1,Hn=null,Pr=null,Vo,pl,Ps;function _S(){sn=new cy({antialias:!0}),sn.setSize(window.innerWidth,window.innerHeight),sn.setPixelRatio(Math.min(window.devicePixelRatio,2)),sn.shadowMap.enabled=!0,sn.shadowMap.type=ku,sn.toneMapping=Gu,sn.toneMappingExposure=1.2,sn.outputColorSpace=_n,document.body.appendChild(sn.domElement),Ye=new Lm,Ye.background=new Ae(657954),Ye.fog=new Rl(789528,.022),yt=new un(75,window.innerWidth/window.innerHeight,.1,100),Nt=new wt,Rs=new wt,Nt.add(Rs),Rs.add(yt),Ye.add(Nt);const[i,e]=Bl(24,24);Nt.position.set(i,_.playerHeight,e);const t=new At,n=[];for(let l=0;l<200;l++)n.push((Math.random()-.5)*80,20+Math.random()*15,(Math.random()-.5)*80);t.setAttribute("position",new et(n,3)),dl=new Lh(t,new Vc({color:16777198,size:.08,transparent:!0,opacity:.7})),Ye.add(dl),hl=new E0(5596808,.8),Ye.add(hl),En=new Vh(13426175,1.2),En.position.set(20,30,15),En.castShadow=!0,En.shadow.camera.left=-20,En.shadow.camera.right=20,En.shadow.camera.top=20,En.shadow.camera.bottom=-20,En.shadow.mapSize.width=4096,En.shadow.mapSize.height=4096,En.shadow.bias=-2e-4,Ye.add(En);const s=new y0(14544639,15,50,Math.PI/6,.7,1);s.position.set(.1,-.2,0),s.target.position.set(0,0,-1),yt.add(s),yt.add(s.target);const r=new Vh(16733474,.35);r.position.set(-10,10,-10),Ye.add(r),Ye.add(new v0(6719692,4469538,.3)),ul=new H(new mt(.8,12,12),new nt({color:16772744})),fl=new H(new mt(.5,10,10),new nt({color:14544639})),Ye.add(ul),Ye.add(fl);const o=yy(Ye);Ou=o.mapGroup,_.physicsBarrels=o.kickBarrels,_.physicsBarrels.forEach(l=>{l.scene=Ye}),zy((l,h)=>Hl(l,h||Ye)),My(Ye,_),_.medStations=Sy(Ye);const a=300;Vo=new At,Ps=new Float32Array(a*3),pl=[];for(let l=0;l<a;l++)Ps[l*3]=Math.random()*Zt,Ps[l*3+1]=Math.random()*2.5,Ps[l*3+2]=Math.random()*Jt,pl.push({vx:(Math.random()-.5)*.3,vy:Math.random()*.1,vz:(Math.random()-.5)*.3});Vo.setAttribute("position",new et(Ps,3)),Ye.add(new Lh(Vo,new Vc({color:10061943,size:.03,transparent:!0,opacity:.4,depthWrite:!1}))),St=kl("rifle"),St.position.set(.18,-.14,-.3),yt.add(St),Nf(yt),Gs=new my(sn),Gs.addPass(new gy(Ye,yt)),Us=new Rf(mS),Us.renderToScreen=!0,Gs.addPass(Us),aM(Ye,yt,Nt,Rs,Ou),ky(Ye,yt,Nt),EM(Nt,Rs,yt,Us,Ye),Wf();const c=(l,h,u)=>{_.alive&&(_.health=Math.max(0,_.health-l),_.damageFlashTime=.3,wy(),_.health<30&&_.health>0&&Wn("lowHealth"),Zn(),If(),_.health<=0&&(_.alive=!1,ES()))};_M(c),Jy(c),Zy(l=>{l.netId&&kd()&&Bd(l.netId,l.score||10)}),Fd(Ye),qf(Co),window.addEventListener("keydown",vS),window.addEventListener("keyup",xS),window.addEventListener("mousedown",yS),window.addEventListener("mouseup",MS),window.addEventListener("resize",bS),document.getElementById("startBtn").addEventListener("click",Co),document.getElementById("respawnBtn").addEventListener("click",Co),document.getElementById("campaignBtn").addEventListener("click",()=>{const l=document.getElementById("missionSelect");l.style.display=l.style.display==="none"?"block":"none"}),document.querySelectorAll(".mission-item").forEach(l=>{l.addEventListener("click",()=>{if(parseInt(l.getAttribute("data-mission"))!==1){l.style.borderColor="#ff3333",setTimeout(()=>l.style.borderColor="",600);return}Co()})}),document.getElementById("resumeBtn").addEventListener("click",()=>{_.paused=!1,document.getElementById("pauseMenu").style.display="none",sn.domElement.requestPointerLock()}),document.addEventListener("pointerlockchange",()=>{!document.pointerLockElement&&_.started&&_.alive&&!_.paused&&(_.paused=!0,document.getElementById("pauseMenu").style.display="flex")}),Kd()}let Zl=!1;function vS(i){if(_.keys[i.key.toLowerCase()]=!0,!(!_.started||_.paused||!_.alive)){if(i.key.toLowerCase()==="r"&&Of(),i.key.toLowerCase()==="g"&&fM(ks()),i.key.toLowerCase()==="x"&&dM(ks()),i.key.toLowerCase()==="f"&&(Kl=!0),i.key==="1"&&Un("rifle"),i.key==="2"&&Un("shotgun"),i.key==="3"&&Un("pistol"),i.key==="4"&&Un("sniper"),i.key==="5"&&Un("lmg"),i.key==="6"&&Un("flamethrower"),i.key==="7"&&Un("chainsaw"),i.key==="8"&&Un("wand_fire"),i.key==="9"&&Un("wand_ice"),i.key==="0"&&Un("wand_lightning"),i.key==="-"&&Un("wand_earth"),i.code==="Space"&&(i.preventDefault(),hM(ks())),i.key==="Tab"){i.preventDefault();const e=document.getElementById("minimap");e&&(e.style.display=e.style.display==="none"?"block":"none")}i.key==="Escape"&&(i.preventDefault(),_.started&&_.alive&&(_.paused=!_.paused,_.paused?(document.getElementById("pauseMenu").style.display="flex",document.exitPointerLock()):(document.getElementById("pauseMenu").style.display="none",sn.domElement.requestPointerLock())))}}function xS(i){_.keys[i.key.toLowerCase()]=!1,i.key.toLowerCase()==="f"&&(Kl=!1,Hn&&(Ye.remove(Hn),Hn=null,Pr&&Vs<=0&&(Vs=40,vM(Ye,Pr,vn),Pr=null)))}function yS(i){i.button===2&&(Zl=!0,Pf(),_.started&&!_.paused&&_.alive&&(_.weapon==="sniper"?(_.aiming=!_.aiming,_.targetFov=_.aiming?30:75):Ff())),i.button===0&&_.started&&!_.paused&&_.alive&&SS()}function MS(i){i.button===2&&(Zl=!1)}function SS(){const i=ks();let e=!1;_.enemies.forEach(t=>{if(t.dead)return;const n=t.x-Nt.position.x,s=t.z-Nt.position.z,r=Math.hypot(n,s),o=n/r*i.x+s/r*i.z;r<3.5&&o>.6&&(e=!0,t.hp-=500,pi(t,!0,new P(i.x*5,5,i.z*5)))}),e&&(_.screenShake=.3,_.shakeIntensity=.2,Et("headshot"))}function Un(i){if(_.reloading||_.paused)return;_.weapon=i;const e=bn[i];_.maxAmmo=e.mag,_.ammo=e.mag,_.shootRate=e.fireRate,_.reloadTime=e.reloadTime,_.aiming=!1,_.targetFov=75,yt.remove(St),St=kl(i),St.position.set(i==="pistol"?.14:.18,i==="pistol"?-.16:-.14,-.3),yt.add(St),Zn(),Cy(e.name)}function Co(){Pf(),_y(),Df.init(),_.health=_.maxHealth,_.weapon="rifle",_.ammo=bn.rifle.mag,_.maxAmmo=bn.rifle.mag,_.score=0,_.kills=0,_.wave=0,_.alive=!0,_.started=!0,_.paused=!1,_.reloading=!1,_.grenadeCount=_.maxGrenades,_.empCount=1,_.combo=0,_.comboTimer=0,_.sprint=_.maxSprint,_.enemies.length=0,_.particles.length=0,_.projectiles.forEach(n=>Ye.remove(n.mesh)),_.projectiles.length=0,_.grenades.forEach(n=>Ye.remove(n.mesh)),_.grenades.length=0,_.corpses.forEach(n=>{n.mesh&&Ye.remove(n.mesh)}),_.corpses.length=0,_.bloodDecals.forEach(n=>Ye.remove(n)),_.bloodDecals.length=0,_.damageNumbers.forEach(n=>Ye.remove(n.sprite)),_.damageNumbers.length=0,_.captureZones.forEach(n=>{n.captured=!1,n.progress=0}),_.raccoons.forEach(n=>Ye.remove(n.mesh)),_.raccoons.length=0,_.physicsBarrels.forEach(n=>{n.vx=0,n.vy=0,n.vz=0,n.grounded=!0,n.hasExploded=!1,n.spinning=!1,n.mesh&&(n.mesh.position.set(n.mesh.userData.baseX??n.x,n.mesh.userData.baseY??.45,n.mesh.userData.baseZ??n.z),n.mesh.rotation.set(0,0,0))}),Vs=0;const[i,e]=Bl(24,24);Nt.position.set(i,_.playerHeight,e),_.mouse.x=0,_.mouse.y=0,Nt.rotation.y=0,Rs.rotation.x=0,yt.remove(St),St=kl("rifle"),St.position.set(.18,-.14,-.3),yt.add(St),Nf(yt),Gf(),Zn();const t=document.getElementById("player-count");t&&(t.style.display="block"),sn.domElement.requestPointerLock(),zf(),_.networkMode?Hd():setTimeout(jd,4e3)}function jd(){if(!_.alive||_.networkMode)return;Yd=_.kills,jl=_.headshots||0,Js=0,da=0,_.wave++,_.waveActive=!0,Bf(_.wave),kf(_.wave,_.wave%5===0),Wn(_.wave%5===0?"bossWave":"waveStart");const i=8+_.wave*4,e=_.wave>=3?Math.floor(_.wave):0,t=_.wave>=2?Math.floor(_.wave):0,n=Math.max(1,i-e-t);for(let s=0;s<n;s++)As("grunt");for(let s=0;s<e;s++)As("heavy");for(let s=0;s<t;s++)As("ranger");if(_.wave>=3){const s=_.wave>=6?Math.floor(_.wave/2):Math.min(2,Math.floor(_.wave/3));for(let r=0;r<s;r++)Za();s>0&&st(`⚠ ${s} COMMUNIST DRONE${s>1?"S":""} INBOUND — THREAT TO BATTALION`)}if(_.wave%5===0){st("BOSS WAVE — HEAVY REINFORCEMENTS + DRONE SWARM");for(let s=0;s<3+Math.floor(_.wave/5);s++)As("heavy");for(let s=0;s<3;s++)Za()}_.wave>=3&&setTimeout(()=>{if(!_.alive||_.paused)return;const s=Math.floor(_.wave/2);st("REINFORCEMENTS INCOMING");for(let r=0;r<s;r++)As(Math.random()<.3?"ranger":"grunt");_.wave>=5&&Za()},1e4+Math.random()*5e3),(_.wave===10||_.wave>10&&_.wave%10===0)&&setTimeout(()=>{_.alive&&(Yy(),st("⚠ WAVE "+_.wave+" — COMMISSAR INCOMING"))},8e3),Zn()}function ES(){if(Wn("death"),_.networkMode)document.exitPointerLock();else{const i=Js>0?da/Js*100:0;Yf(_.wave,_.kills,_.headshots||0,i,_.score),document.exitPointerLock()}}function Kd(){requestAnimationFrame(Kd);const i=performance.now(),e=Math.min((i-Fu)/1e3,.1);if(Fu=i,Us&&(Us.uniforms.time.value=i*.001),Vs>0&&(Vs-=e),_.started&&!_.paused&&_.alive){if(Kl&&Vs<=0){Hn||(Hn=new zm(new At().setFromPoints([Nt.position,Nt.position]),new ff({color:65280,linewidth:3})),Ye.add(Hn));const t=new la,n=Nt.position.clone();n.y+=yt.position.y;const s=new P(0,0,-1).applyQuaternion(yt.quaternion).applyQuaternion(Nt.quaternion).normalize();t.set(n,s);const r=t.intersectObjects(Ye.children,!0);let o=n.clone().add(s.multiplyScalar(100));for(let a=0;a<r.length;a++)if(r[a].object.name!=="bullet"){o=r[a].point;break}Pr=o,Hn.geometry.setFromPoints([Nt.position.clone().add(new P(0,-.2,0)),o])}}else Hn&&(Ye.remove(Hn),Hn=null,Pr=null);if(!_.started||_.paused){Gs.render();return}if(wM(e),_.networkMode&&i-zu>50&&(zd(Nt.position,Nt.rotation),zu=i),_.pendingRespawn&&(Nt.position.copy(_.pendingRespawn),_.pendingRespawn=null,document.pointerLockElement||sn.domElement.requestPointerLock()),_.networkMode&&Gd(yt),_.shootCooldown>0&&(_.shootCooldown-=e*1e3),Zl&&_.alive&&!_.paused){const t=_.kills,n=_.headshots||0;Ff(),_.kills>t&&da++,(_.headshots||0)>n&&jl++,Js++}if(cM(i),_.alive&&(Ky(e),_.alive&&TS(),ic+=e,ic>=gS&&(ic=0,Dy()))){const t=1+Math.floor(_.wave/3);for(let n=0;n<t;n++)$y();st("⚠ RACCOON SKULLS EMERGING FROM THE DARK")}if(Iy(e,Ye,dl,hl,En,ul,fl,Zt,Jt),yt.fov!==_.targetFov&&(yt.fov=ut.lerp(yt.fov,_.targetFov,.1),yt.updateProjectionMatrix()),_.screenShake>0&&(yt.position.x+=(Math.random()-.5)*_.shakeIntensity,yt.position.y+=(Math.random()-.5)*_.shakeIntensity,_.screenShake=Math.max(0,_.screenShake-e*4)),_.damageFlashTime>0){const t=document.getElementById("dmgFlash");t&&(t.style.opacity=_.damageFlashTime.toFixed(2)),_.damageFlashTime=Math.max(0,_.damageFlashTime-e*4),_.damageFlashTime<=0&&t&&(t.style.opacity="0")}if(_.combo>0&&(_.comboTimer+=e,_.comboTimer>5?(_.combo=0,_.comboTimer=0):Ay(_.combo)),_.alive&&_.health<100&&(_.regenCooldown=(_.regenCooldown||0)+e,_.regenCooldown>5&&(_.health=Math.min(100,_.health+2*e))),oM(e),_.weapon==="chainsaw"&&rM(St,e),_.alive&&!_.paused&&St){const t=CM(),n=AM();if(_.reloading){const s=performance.now()-(_.reloadStart||0),r=Math.min(1,s/(_.reloadTime||1500)),o=r<.5?ut.lerp(0,-.22,r*2):ut.lerp(-.22,0,(r-.5)*2),a=-.14;St.position.y=ut.lerp(St.position.y,a+o,.15),St.rotation.x=ut.lerp(St.rotation.x,-.25+o*.5,.12)}else n?(St.rotation.x=ut.lerp(St.rotation.x,Math.sin(t*1)*.055,.18),St.rotation.z=ut.lerp(St.rotation.z,Math.sin(t*.5)*.03,.15)):(St.rotation.x=ut.lerp(St.rotation.x,0,.12),St.rotation.z=ut.lerp(St.rotation.z,0,.12))}Ly(Ye,e),Uy(Ye,e),By(Ye,e),Fy(Ye,e),uM(Ye,e),pM(Ye,e),mM(Ye,e),gM(e),Ny(Ps,pl,Vo,Zt,Jt),If(),Zn(),Xf(Qi,Zt,Jt,Nt),Gs.render()}function TS(){if(_.networkMode)return;const i=_.enemies.filter(e=>!e.dead&&e.type!=="drone");if(_.waveActive&&i.length===0&&_.wave>0){_.waveActive=!1;const e=_.kills-Yd,t=(_.headshots||0)-jl,n=Js>0?da/Js*100:0,s=_.wave*150;_.score+=s,st(`⭐ WAVE ${_.wave} CLEAR — +${s} BONUS`),Hf(),$f(_.wave,e,t,n),setTimeout(jd,5e3)}}function bS(){yt.aspect=window.innerWidth/window.innerHeight,yt.updateProjectionMatrix(),sn.setSize(window.innerWidth,window.innerHeight),Gs.setSize(window.innerWidth,window.innerHeight)}window.addEventListener("DOMContentLoaded",_S);
