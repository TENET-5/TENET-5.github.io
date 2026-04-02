const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./geometry.vertex-C5J6JgXf.js","./index-B4NgycvP.js","./bonesVertex-BmjHCnqz.js","./morphTargetsVertex-CEV2KkxJ.js","./clipPlaneVertex-C9mUhR5u.js","./bumpVertex-Bzi0Pfeg.js","./geometry.fragment-BxDvLGm1.js","./clipPlaneFragment-BOGrncCW.js","./bumpFragment-gnDbUF7i.js","./samplerFragmentDeclaration-UiGPv2Z7.js"])))=>i.map(i=>d[i]);
import{r as V,L as ce,t as re,u as Te,i as W,v as D,w as se,f as G,b as P,x as ne,y as _e,z as me,A as pe,M as Ee,D as ge,G as xe,H as ve,J as q,K as Re,_ as Ie}from"./index-B4NgycvP.js";V.prototype.restoreSingleAttachment=function(){const d=this._gl;this.bindAttachments([d.BACK])};V.prototype.restoreSingleAttachmentForRenderTarget=function(){const d=this._gl;this.bindAttachments([d.COLOR_ATTACHMENT0])};V.prototype.buildTextureLayout=function(d,e=!1){const s=this._gl,i=[];if(e)i.push(s.BACK);else for(let t=0;t<d.length;t++)d[t]?i.push(s["COLOR_ATTACHMENT"+t]):i.push(s.NONE);return i};V.prototype.bindAttachments=function(d){this._gl.drawBuffers(d)};V.prototype.unBindMultiColorAttachmentFramebuffer=function(d,e=!1,s){this._currentRenderTarget=null,d.disableAutomaticMSAAResolve||this.resolveMultiFramebuffer(d),e||this.generateMipMapsMultiFramebuffer(d),s&&(d._MSAAFramebuffer&&this._bindUnboundFramebuffer(d._framebuffer),s()),this._bindUnboundFramebuffer(null)};V.prototype.createMultipleRenderTarget=function(d,e,s=!0){let i=!1,t=!0,a=!1,l=!1,h,p=1,x=1;const o=0,E=3,L=!1,C=5,B=3553;let S=[],u=[],f=[],T=[],R=[],g=[],n=[],A=[],U=[],N=!1;const v=this._createHardwareRenderTargetWrapper(!0,!1,d);e!==void 0&&(i=e.generateMipMaps===void 0?!1:e.generateMipMaps,t=e.generateDepthBuffer===void 0?!0:e.generateDepthBuffer,a=e.generateStencilBuffer===void 0?!1:e.generateStencilBuffer,l=e.generateDepthTexture===void 0?!1:e.generateDepthTexture,p=e.textureCount??1,x=e.samples??x,S=e.types||S,u=e.samplingModes||u,f=e.useSRGBBuffers||f,T=e.formats||T,R=e.targetTypes||R,g=e.faceIndex||g,n=e.layerIndex||n,A=e.layerCounts||A,U=e.labels||U,N=e.dontCreateTextures??!1,this.webGLVersion>1&&(e.depthTextureFormat===13||e.depthTextureFormat===17||e.depthTextureFormat===16||e.depthTextureFormat===14||e.depthTextureFormat===18)&&(h=e.depthTextureFormat)),h===void 0&&(h=a?13:14);const r=this._gl,w=this._currentFramebuffer,H=r.createFramebuffer();this._bindUnboundFramebuffer(H);const c=d.width??d,O=d.height??d,k=[],Y=[],Z=this.webGLVersion>1&&(h===13||h===17||h===18);v.label=(e==null?void 0:e.label)??"MultiRenderTargetWrapper",v._framebuffer=H,v._generateDepthBuffer=l||t,v._generateStencilBuffer=l?Z:a,v._depthStencilBuffer=this._setupFramebufferDepthAttachments(v._generateStencilBuffer,v._generateDepthBuffer,c,O,1,h),v._attachments=Y;for(let _=0;_<p;_++){let y=u[_]||E,b=S[_]||o,X=f[_]||L;const F=T[_]||C,M=R[_]||B,ee=A[_]??1;(b===1&&!this._caps.textureFloatLinearFiltering||b===2&&!this._caps.textureHalfFloatLinearFiltering)&&(y=1);const te=this._getSamplingParameters(y,i);b===1&&!this._caps.textureFloat&&(b=0,ce.Warn("Float textures are not supported. Render target forced to TEXTURETYPE_UNSIGNED_BYTE type")),X=X&&this._caps.supportSRGBBuffers&&(this.webGLVersion>1||this.isWebGPU);const ie=this.webGLVersion>1,he=r[ie?"COLOR_ATTACHMENT"+_:"COLOR_ATTACHMENT"+_+"_WEBGL"];if(Y.push(he),M===-1||N)continue;const I=new re(this,6);k[_]=I,r.activeTexture(r["TEXTURE"+_]),r.bindTexture(M,I._hardwareTexture.underlyingResource),r.texParameteri(M,r.TEXTURE_MAG_FILTER,te.mag),r.texParameteri(M,r.TEXTURE_MIN_FILTER,te.min),r.texParameteri(M,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(M,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);const z=this._getRGBABufferInternalSizedFormat(b,F,X),j=this._getInternalFormat(F),K=this._getWebGLTextureType(b);if(ie&&(M===35866||M===32879))M===35866?I.is2DArray=!0:I.is3D=!0,I.baseDepth=I.depth=ee,r.texImage3D(M,0,z,c,O,ee,0,j,K,null);else if(M===34067){for(let $=0;$<6;$++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,z,c,O,0,j,K,null);I.isCube=!0}else r.texImage2D(r.TEXTURE_2D,0,z,c,O,0,j,K,null);i&&r.generateMipmap(M),this._bindTextureDirectly(M,null),I.baseWidth=c,I.baseHeight=O,I.width=c,I.height=O,I.isReady=!0,I.samples=1,I.generateMipMaps=i,I.samplingMode=y,I.type=b,I._useSRGBBuffer=X,I.format=F,I.label=U[_]??v.label+"-Texture"+_,this._internalTexturesCache.push(I)}if(l&&this._caps.depthTextureExtension&&!N){const _=new re(this,14);let y=5,b=r.DEPTH_COMPONENT16,X=r.DEPTH_COMPONENT,F=r.UNSIGNED_SHORT,M=r.DEPTH_ATTACHMENT;this.webGLVersion<2?b=r.DEPTH_COMPONENT:h===14?(y=1,F=r.FLOAT,b=r.DEPTH_COMPONENT32F):h===18?(y=0,F=r.FLOAT_32_UNSIGNED_INT_24_8_REV,b=r.DEPTH32F_STENCIL8,X=r.DEPTH_STENCIL,M=r.DEPTH_STENCIL_ATTACHMENT):h===16?(y=0,F=r.UNSIGNED_INT,b=r.DEPTH_COMPONENT24,M=r.DEPTH_ATTACHMENT):(h===13||h===17)&&(y=12,F=r.UNSIGNED_INT_24_8,b=r.DEPTH24_STENCIL8,X=r.DEPTH_STENCIL,M=r.DEPTH_STENCIL_ATTACHMENT),this._bindTextureDirectly(r.TEXTURE_2D,_,!0),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texImage2D(r.TEXTURE_2D,0,b,c,O,0,X,F,null),r.framebufferTexture2D(r.FRAMEBUFFER,M,r.TEXTURE_2D,_._hardwareTexture.underlyingResource,0),this._bindTextureDirectly(r.TEXTURE_2D,null),v._depthStencilTexture=_,v._depthStencilTextureWithStencil=Z,_.baseWidth=c,_.baseHeight=O,_.width=c,_.height=O,_.isReady=!0,_.samples=1,_.generateMipMaps=i,_.samplingMode=1,_.format=h,_.type=y,_.label=v.label+"-DepthStencil",k[p]=_,this._internalTexturesCache.push(_)}if(v.setTextures(k),s&&r.drawBuffers(Y),this._bindUnboundFramebuffer(w),v.setLayerAndFaceIndices(n,g),this.resetTextureCache(),!N)this.updateMultipleRenderTargetTextureSampleCount(v,x,s);else if(x>1){const _=r.createFramebuffer();if(!_)throw new Error("Unable to create multi sampled framebuffer");v._samples=x,v._MSAAFramebuffer=_,p>0&&s&&(this._bindUnboundFramebuffer(_),r.drawBuffers(Y),this._bindUnboundFramebuffer(w))}return v};V.prototype.updateMultipleRenderTargetTextureSampleCount=function(d,e,s=!0){if(this.webGLVersion<2||!d)return 1;if(d.samples===e)return e;const i=this._gl;e=Math.min(e,this.getCaps().maxMSAASamples),d._depthStencilBuffer&&(i.deleteRenderbuffer(d._depthStencilBuffer),d._depthStencilBuffer=null),d._MSAAFramebuffer&&(i.deleteFramebuffer(d._MSAAFramebuffer),d._MSAAFramebuffer=null);const t=d._attachments.length;for(let l=0;l<t;l++){const p=d.textures[l]._hardwareTexture;p==null||p.releaseMSAARenderBuffers()}if(e>1&&typeof i.renderbufferStorageMultisample=="function"){const l=i.createFramebuffer();if(!l)throw new Error("Unable to create multi sampled framebuffer");d._MSAAFramebuffer=l,this._bindUnboundFramebuffer(l);const h=[];for(let p=0;p<t;p++){const x=d.textures[p],o=x._hardwareTexture,E=i[this.webGLVersion>1?"COLOR_ATTACHMENT"+p:"COLOR_ATTACHMENT"+p+"_WEBGL"],L=this._createRenderBuffer(x.width,x.height,e,-1,this._getRGBABufferInternalSizedFormat(x.type,x.format,x._useSRGBBuffer),E);if(!L)throw new Error("Unable to create multi sampled framebuffer");o.addMSAARenderBuffer(L),x.samples=e,h.push(E)}s&&i.drawBuffers(h)}else this._bindUnboundFramebuffer(d._framebuffer);const a=d._depthStencilTexture?d._depthStencilTexture.format:void 0;return d._depthStencilBuffer=this._setupFramebufferDepthAttachments(d._generateStencilBuffer,d._generateDepthBuffer,d.width,d.height,e,a),this._bindUnboundFramebuffer(null),d._samples=e,e};V.prototype.generateMipMapsMultiFramebuffer=function(d){const e=d,s=this._gl;if(e.isMulti)for(let i=0;i<e._attachments.length;i++){const t=e.textures[i];t!=null&&t.generateMipMaps&&!(t!=null&&t.isCube)&&!(t!=null&&t.is3D)&&(this._bindTextureDirectly(s.TEXTURE_2D,t,!0),s.generateMipmap(s.TEXTURE_2D),this._bindTextureDirectly(s.TEXTURE_2D,null))}};V.prototype.resolveMultiFramebuffer=function(d){const e=d,s=this._gl;if(!e._MSAAFramebuffer||!e.isMulti)return;let i=e.resolveMSAAColors?s.COLOR_BUFFER_BIT:0;i|=e._generateDepthBuffer&&e.resolveMSAADepth?s.DEPTH_BUFFER_BIT:0,i|=e._generateStencilBuffer&&e.resolveMSAAStencil?s.STENCIL_BUFFER_BIT:0;const t=e._attachments,a=t.length;s.bindFramebuffer(s.READ_FRAMEBUFFER,e._MSAAFramebuffer),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,e._framebuffer);for(let l=0;l<a;l++){const h=e.textures[l];for(let p=0;p<a;p++)t[p]=s.NONE;t[l]=s[this.webGLVersion>1?"COLOR_ATTACHMENT"+l:"COLOR_ATTACHMENT"+l+"_WEBGL"],s.readBuffer(t[l]),s.drawBuffers(t),s.blitFramebuffer(0,0,h.width,h.height,0,0,h.width,h.height,i,s.NEAREST)}for(let l=0;l<a;l++)t[l]=s[this.webGLVersion>1?"COLOR_ATTACHMENT"+l:"COLOR_ATTACHMENT"+l+"_WEBGL"];s.drawBuffers(t),s.bindFramebuffer(this._gl.FRAMEBUFFER,e._MSAAFramebuffer)};class Me extends Te{get isSupported(){var e;return((e=this._engine)==null?void 0:e.getCaps().drawBuffersExtension)??!1}get textures(){return this._textures}get count(){return this._count}get depthTexture(){return this._textures[this._textures.length-1]}set wrapU(e){if(this._textures)for(let s=0;s<this._textures.length;s++)this._textures[s].wrapU=e}set wrapV(e){if(this._textures)for(let s=0;s<this._textures.length;s++)this._textures[s].wrapV=e}constructor(e,s,i,t,a,l){const h=a&&a.generateMipMaps?a.generateMipMaps:!1,p=a&&a.generateDepthTexture?a.generateDepthTexture:!1,x=a&&a.depthTextureFormat?a.depthTextureFormat:15,o=!a||a.doNotChangeAspectRatio===void 0?!0:a.doNotChangeAspectRatio,E=a&&a.drawOnlyOnFirstAttachmentByDefault?a.drawOnlyOnFirstAttachmentByDefault:!1;if(super(e,s,t,h,o,void 0,void 0,void 0,void 0,void 0,void 0,void 0,!0),!this.isSupported){this.dispose();return}this._textureNames=l;const L=[],C=[],B=[],S=[],u=[],f=[],T=[],R=[];this._initTypes(i,L,C,B,S,u,f,T,R,a);const g=!a||a.generateDepthBuffer===void 0?!0:a.generateDepthBuffer,n=!a||a.generateStencilBuffer===void 0?!1:a.generateStencilBuffer,A=a&&a.samples?a.samples:1;this._multiRenderTargetOptions={samplingModes:C,generateMipMaps:h,generateDepthBuffer:g,generateStencilBuffer:n,generateDepthTexture:p,depthTextureFormat:x,types:L,textureCount:i,useSRGBBuffers:B,samples:A,formats:S,targetTypes:u,faceIndex:f,layerIndex:T,layerCounts:R,labels:l,label:e},this._count=i,this._drawOnlyOnFirstAttachmentByDefault=E,i>0&&(this._createInternalTextures(),this._createTextures(l))}_initTypes(e,s,i,t,a,l,h,p,x,o){for(let E=0;E<e;E++)o&&o.types&&o.types[E]!==void 0?s.push(o.types[E]):s.push(o&&o.defaultType?o.defaultType:0),o&&o.samplingModes&&o.samplingModes[E]!==void 0?i.push(o.samplingModes[E]):i.push(W.BILINEAR_SAMPLINGMODE),o&&o.useSRGBBuffers&&o.useSRGBBuffers[E]!==void 0?t.push(o.useSRGBBuffers[E]):t.push(!1),o&&o.formats&&o.formats[E]!==void 0?a.push(o.formats[E]):a.push(5),o&&o.targetTypes&&o.targetTypes[E]!==void 0?l.push(o.targetTypes[E]):l.push(3553),o&&o.faceIndex&&o.faceIndex[E]!==void 0?h.push(o.faceIndex[E]):h.push(0),o&&o.layerIndex&&o.layerIndex[E]!==void 0?p.push(o.layerIndex[E]):p.push(0),o&&o.layerCounts&&o.layerCounts[E]!==void 0?x.push(o.layerCounts[E]):x.push(1)}_createInternaTextureIndexMapping(){const e={},s=[];if(!this._renderTarget)return s;const i=this._renderTarget.textures;for(let t=0;t<i.length;t++){const a=i[t];if(!a)continue;const l=e[a.uniqueId];l!==void 0?s[t]=l:e[a.uniqueId]=t}return s}_rebuild(e=!1,s=!1,i){if(this._count<1||e)return;const t=this._createInternaTextureIndexMapping();this.releaseInternalTextures(),this._createInternalTextures(),s&&(this._releaseTextures(),this._createTextures(i));const a=this._renderTarget.textures;for(let l=0;l<a.length;l++){const h=this._textures[l];t[l]!==void 0&&this._renderTarget.setTexture(a[t[l]],l),h._texture=a[l],h._texture&&(h._noMipmap=!h._texture.useMipMaps,h._useSRGBBuffer=h._texture._useSRGBBuffer)}this.samples!==1&&this._renderTarget.setSamples(this.samples,!this._drawOnlyOnFirstAttachmentByDefault,!0)}_createInternalTextures(){this._renderTarget=this._getEngine().createMultipleRenderTarget(this._size,this._multiRenderTargetOptions,!this._drawOnlyOnFirstAttachmentByDefault),this._texture=this._renderTarget.texture}_releaseTextures(){if(this._textures)for(let e=0;e<this._textures.length;e++)this._textures[e]._texture=null,this._textures[e].dispose()}_createTextures(e){const s=this._renderTarget.textures;this._textures=[];for(let i=0;i<s.length;i++){const t=new W(null,this.getScene());e!=null&&e[i]&&(t.name=e[i]),t._texture=s[i],t._texture&&(t._noMipmap=!t._texture.useMipMaps,t._useSRGBBuffer=t._texture._useSRGBBuffer),this._textures.push(t)}}setInternalTexture(e,s,i=!0){var t;if(this.renderTarget&&(s===0&&(this._texture=e),this.renderTarget.setTexture(e,s,i),this.textures[s]||(this.textures[s]=new W(null,this.getScene()),this.textures[s].name=((t=this._textureNames)==null?void 0:t[s])??this.textures[s].name),this.textures[s]._texture=e,this.textures[s]._noMipmap=!e.useMipMaps,this.textures[s]._useSRGBBuffer=e._useSRGBBuffer,this._count=this.renderTarget.textures?this.renderTarget.textures.length:0,this._multiRenderTargetOptions.types&&(this._multiRenderTargetOptions.types[s]=e.type),this._multiRenderTargetOptions.samplingModes&&(this._multiRenderTargetOptions.samplingModes[s]=e.samplingMode),this._multiRenderTargetOptions.useSRGBBuffers&&(this._multiRenderTargetOptions.useSRGBBuffers[s]=e._useSRGBBuffer),this._multiRenderTargetOptions.targetTypes&&this._multiRenderTargetOptions.targetTypes[s]!==-1)){let a;e.is2DArray?a=35866:e.isCube?a=34067:e.is3D?a=32879:a=3553,this._multiRenderTargetOptions.targetTypes[s]=a}}setLayerAndFaceIndex(e,s=-1,i=-1){!this.textures[e]||!this.renderTarget||(this._multiRenderTargetOptions.layerIndex&&(this._multiRenderTargetOptions.layerIndex[e]=s),this._multiRenderTargetOptions.faceIndex&&(this._multiRenderTargetOptions.faceIndex[e]=i),this.renderTarget.setLayerAndFaceIndex(e,s,i))}setLayerAndFaceIndices(e,s){this.renderTarget&&(this._multiRenderTargetOptions.layerIndex=e,this._multiRenderTargetOptions.faceIndex=s,this.renderTarget.setLayerAndFaceIndices(e,s))}get samples(){return this._samples}set samples(e){this._renderTarget?this._samples=this._renderTarget.setSamples(e):this._samples=e}resize(e){this._processSizeParameter(e),this._rebuild(!1,void 0,this._textureNames)}updateCount(e,s,i){this._multiRenderTargetOptions.textureCount=e,this._count=e;const t=[],a=[],l=[],h=[],p=[],x=[],o=[],E=[];this._textureNames=i,this._initTypes(e,t,a,l,h,p,x,o,E,s),this._multiRenderTargetOptions.types=t,this._multiRenderTargetOptions.samplingModes=a,this._multiRenderTargetOptions.useSRGBBuffers=l,this._multiRenderTargetOptions.formats=h,this._multiRenderTargetOptions.targetTypes=p,this._multiRenderTargetOptions.faceIndex=x,this._multiRenderTargetOptions.layerIndex=o,this._multiRenderTargetOptions.layerCounts=E,this._multiRenderTargetOptions.labels=i,this._rebuild(!1,!0,i)}_unbindFrameBuffer(e,s){this._renderTarget&&e.unBindMultiColorAttachmentFramebuffer(this._renderTarget,this.isCube,()=>{this.onAfterRenderObservable.notifyObservers(s)})}dispose(e=!1){this._releaseTextures(),e?this._texture=null:this.releaseInternalTextures(),super.dispose()}releaseInternalTextures(){var s,i;const e=(s=this._renderTarget)==null?void 0:s.textures;if(e){for(let t=e.length-1;t>=0;t--)this._textures[t]._texture=null;(i=this._renderTarget)==null||i.dispose(),this._renderTarget=null}}}const ae="mrtFragmentDeclaration",Se=`#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE)
layout(location=0) out vec4 glFragData[{X}];
#endif
`;D.IncludesShadersStore[ae]||(D.IncludesShadersStore[ae]=Se);const J="geometryPixelShader",fe=`#extension GL_EXT_draw_buffers : require
#if defined(BUMP) || !defined(NORMAL)
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
#ifdef BUMP
varying mat4 vWorldView;varying vec3 vNormalW;
#else
varying vec3 vNormalV;
#endif
varying vec4 vViewPos;
#if defined(POSITION) || defined(BUMP)
varying vec3 vPositionW;
#endif
#if defined(VELOCITY) || defined(VELOCITY_LINEAR)
varying vec4 vCurrentPosition;varying vec4 vPreviousPosition;
#endif
#ifdef NEED_UV
varying vec2 vUV;
#endif
#ifdef BUMP
uniform vec3 vBumpInfos;uniform vec2 vTangentSpaceParams;
#endif
#if defined(REFLECTIVITY)
#if defined(ORMTEXTURE) || defined(SPECULARGLOSSINESSTEXTURE) || defined(REFLECTIVITYTEXTURE)
uniform sampler2D reflectivitySampler;varying vec2 vReflectivityUV;
#else
#ifdef METALLIC_TEXTURE
uniform sampler2D metallicSampler;varying vec2 vMetallicUV;
#endif
#ifdef ROUGHNESS_TEXTURE
uniform sampler2D roughnessSampler;varying vec2 vRoughnessUV;
#endif
#endif
#ifdef ALBEDOTEXTURE
varying vec2 vAlbedoUV;uniform sampler2D albedoSampler;
#endif
#ifdef REFLECTIVITYCOLOR
uniform vec3 reflectivityColor;
#endif
#ifdef ALBEDOCOLOR
uniform vec3 albedoColor;
#endif
#ifdef METALLIC
uniform float metallic;
#endif
#if defined(ROUGHNESS) || defined(GLOSSINESS)
uniform float glossiness;
#endif
#endif
#if defined(ALPHATEST) && defined(NEED_UV)
uniform sampler2D diffuseSampler;
#endif
#include<clipPlaneFragmentDeclaration>
#include<mrtFragmentDeclaration>[SCENE_MRT_COUNT]
#include<bumpFragmentMainFunctions>
#include<bumpFragmentFunctions>
#include<helperFunctions>
void main() {
#include<clipPlaneFragment>
#ifdef ALPHATEST
if (texture2D(diffuseSampler,vUV).a<0.4)
discard;
#endif
vec3 normalOutput;
#ifdef BUMP
vec3 normalW=normalize(vNormalW);
#include<bumpFragment>
#ifdef NORMAL_WORLDSPACE
normalOutput=normalW;
#else
normalOutput=normalize(vec3(vWorldView*vec4(normalW,0.0)));
#endif
#elif defined(HAS_NORMAL_ATTRIBUTE)
normalOutput=normalize(vNormalV);
#elif defined(POSITION)
normalOutput=normalize(-cross(dFdx(vPositionW),dFdy(vPositionW)));
#endif
#ifdef ENCODE_NORMAL
normalOutput=normalOutput*0.5+0.5;
#endif
#ifdef DEPTH
gl_FragData[DEPTH_INDEX]=vec4(vViewPos.z/vViewPos.w,0.0,0.0,1.0);
#endif
#ifdef NORMAL
gl_FragData[NORMAL_INDEX]=vec4(normalOutput,1.0);
#endif
#ifdef SCREENSPACE_DEPTH
gl_FragData[SCREENSPACE_DEPTH_INDEX]=vec4(gl_FragCoord.z,0.0,0.0,1.0);
#endif
#ifdef POSITION
gl_FragData[POSITION_INDEX]=vec4(vPositionW,1.0);
#endif
#ifdef VELOCITY
vec2 a=(vCurrentPosition.xy/vCurrentPosition.w)*0.5+0.5;vec2 b=(vPreviousPosition.xy/vPreviousPosition.w)*0.5+0.5;vec2 velocity=abs(a-b);velocity=vec2(pow(velocity.x,1.0/3.0),pow(velocity.y,1.0/3.0))*sign(a-b)*0.5+0.5;gl_FragData[VELOCITY_INDEX]=vec4(velocity,0.0,1.0);
#endif
#ifdef VELOCITY_LINEAR
vec2 velocity=vec2(0.5)*((vPreviousPosition.xy/vPreviousPosition.w) -
(vCurrentPosition.xy/vCurrentPosition.w));gl_FragData[VELOCITY_LINEAR_INDEX]=vec4(velocity,0.0,1.0);
#endif
#ifdef REFLECTIVITY
vec4 reflectivity=vec4(0.0,0.0,0.0,1.0);
#ifdef METALLICWORKFLOW
float metal=1.0;float roughness=1.0;
#ifdef ORMTEXTURE
metal*=texture2D(reflectivitySampler,vReflectivityUV).b;roughness*=texture2D(reflectivitySampler,vReflectivityUV).g;
#else
#ifdef METALLIC_TEXTURE
metal*=texture2D(metallicSampler,vMetallicUV).r;
#endif
#ifdef ROUGHNESS_TEXTURE
roughness*=texture2D(roughnessSampler,vRoughnessUV).r;
#endif
#endif
#ifdef METALLIC
metal*=metallic;
#endif
#ifdef ROUGHNESS
roughness*=(1.0-glossiness); 
#endif
reflectivity.a-=roughness;vec3 color=vec3(1.0);
#ifdef ALBEDOTEXTURE
color=texture2D(albedoSampler,vAlbedoUV).rgb;
#ifdef GAMMAALBEDO
color=toLinearSpace(color);
#endif
#endif
#ifdef ALBEDOCOLOR
color*=albedoColor.xyz;
#endif
reflectivity.rgb=mix(vec3(0.04),color,metal);
#else
#if defined(SPECULARGLOSSINESSTEXTURE) || defined(REFLECTIVITYTEXTURE)
reflectivity=texture2D(reflectivitySampler,vReflectivityUV);
#ifdef GAMMAREFLECTIVITYTEXTURE
reflectivity.rgb=toLinearSpace(reflectivity.rgb);
#endif
#else 
#ifdef REFLECTIVITYCOLOR
reflectivity.rgb=toLinearSpace(reflectivityColor.xyz);reflectivity.a=1.0;
#endif
#endif
#ifdef GLOSSINESSS
reflectivity.a*=glossiness; 
#endif
#endif
gl_FragData[REFLECTIVITY_INDEX]=reflectivity;
#endif
}
`;D.ShadersStore[J]||(D.ShadersStore[J]=fe);const be={name:J,shader:fe},Le=Object.freeze(Object.defineProperty({__proto__:null,geometryPixelShader:be},Symbol.toStringTag,{value:"Module"})),le="geometryVertexDeclaration",Oe="uniform mat4 viewProjection;uniform mat4 view;";D.IncludesShadersStore[le]||(D.IncludesShadersStore[le]=Oe);const ue="geometryUboDeclaration",Ae=`#include<sceneUboDeclaration>
`;D.IncludesShadersStore[ue]||(D.IncludesShadersStore[ue]=Ae);const Q="geometryVertexShader",oe=`precision highp float;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
#include<__decl__geometryVertex>
#include<clipPlaneVertexDeclaration>
attribute vec3 position;
#ifdef HAS_NORMAL_ATTRIBUTE
attribute vec3 normal;
#endif
#ifdef NEED_UV
varying vec2 vUV;
#ifdef ALPHATEST
uniform mat4 diffuseMatrix;
#endif
#ifdef BUMP
uniform mat4 bumpMatrix;varying vec2 vBumpUV;
#endif
#ifdef REFLECTIVITY
uniform mat4 reflectivityMatrix;uniform mat4 albedoMatrix;varying vec2 vReflectivityUV;varying vec2 vAlbedoUV;
#endif
#ifdef METALLIC_TEXTURE
varying vec2 vMetallicUV;uniform mat4 metallicMatrix;
#endif
#ifdef ROUGHNESS_TEXTURE
varying vec2 vRoughnessUV;uniform mat4 roughnessMatrix;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#ifdef BUMP
varying mat4 vWorldView;
#endif
#ifdef BUMP
varying vec3 vNormalW;
#else
varying vec3 vNormalV;
#endif
varying vec4 vViewPos;
#if defined(POSITION) || defined(BUMP)
varying vec3 vPositionW;
#endif
#if defined(VELOCITY) || defined(VELOCITY_LINEAR)
uniform mat4 previousViewProjection;varying vec4 vCurrentPosition;varying vec4 vPreviousPosition;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef HAS_NORMAL_ATTRIBUTE
vec3 normalUpdated=normal;
#else
vec3 normalUpdated=vec3(0.0,0.0,0.0);
#endif
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#if (defined(VELOCITY) || defined(VELOCITY_LINEAR)) && !defined(BONES_VELOCITY_ENABLED)
vCurrentPosition=viewProjection*finalWorld*vec4(positionUpdated,1.0);vPreviousPosition=previousViewProjection*finalPreviousWorld*vec4(positionUpdated,1.0);
#endif
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=vec4(finalWorld*vec4(positionUpdated,1.0));
#ifdef BUMP
vWorldView=view*finalWorld;mat3 normalWorld=mat3(finalWorld);vNormalW=normalize(normalWorld*normalUpdated);
#else
#ifdef NORMAL_WORLDSPACE
vNormalV=normalize(vec3(finalWorld*vec4(normalUpdated,0.0)));
#else
vNormalV=normalize(vec3((view*finalWorld)*vec4(normalUpdated,0.0)));
#endif
#endif
vViewPos=view*worldPos;
#if (defined(VELOCITY) || defined(VELOCITY_LINEAR)) && defined(BONES_VELOCITY_ENABLED)
vCurrentPosition=viewProjection*finalWorld*vec4(positionUpdated,1.0);
#if NUM_BONE_INFLUENCERS>0
mat4 previousInfluence;previousInfluence=mPreviousBones[int(matricesIndices[0])]*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
previousInfluence+=mPreviousBones[int(matricesIndices[1])]*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
previousInfluence+=mPreviousBones[int(matricesIndices[2])]*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
previousInfluence+=mPreviousBones[int(matricesIndices[3])]*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[0])]*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[1])]*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[2])]*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[3])]*matricesWeightsExtra[3];
#endif
vPreviousPosition=previousViewProjection*finalPreviousWorld*previousInfluence*vec4(positionUpdated,1.0);
#else
vPreviousPosition=previousViewProjection*finalPreviousWorld*vec4(positionUpdated,1.0);
#endif
#endif
#if defined(POSITION) || defined(BUMP)
vPositionW=worldPos.xyz/worldPos.w;
#endif
gl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);
#include<clipPlaneVertex>
#ifdef NEED_UV
#ifdef UV1
#if defined(ALPHATEST) && defined(ALPHATEST_UV1)
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#else
vUV=uvUpdated;
#endif
#ifdef BUMP_UV1
vBumpUV=vec2(bumpMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef REFLECTIVITY_UV1
vReflectivityUV=vec2(reflectivityMatrix*vec4(uvUpdated,1.0,0.0));
#else
#ifdef METALLIC_UV1
vMetallicUV=vec2(metallicMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef ROUGHNESS_UV1
vRoughnessUV=vec2(roughnessMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#endif
#ifdef ALBEDO_UV1
vAlbedoUV=vec2(albedoMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#endif
#ifdef UV2
#if defined(ALPHATEST) && defined(ALPHATEST_UV2)
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#else
vUV=uv2Updated;
#endif
#ifdef BUMP_UV2
vBumpUV=vec2(bumpMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#ifdef REFLECTIVITY_UV2
vReflectivityUV=vec2(reflectivityMatrix*vec4(uv2Updated,1.0,0.0));
#else
#ifdef METALLIC_UV2
vMetallicUV=vec2(metallicMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#ifdef ROUGHNESS_UV2
vRoughnessUV=vec2(roughnessMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef ALBEDO_UV2
vAlbedoUV=vec2(albedoMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#endif
#include<bumpVertex>
}
`;D.ShadersStore[Q]||(D.ShadersStore[Q]=oe);const Pe={name:Q,shader:oe},Ce=Object.freeze(Object.defineProperty({__proto__:null,geometryVertexShader:Pe},Symbol.toStringTag,{value:"Module"})),de=["world","mBones","viewProjection","diffuseMatrix","view","previousWorld","previousViewProjection","mPreviousBones","bumpMatrix","reflectivityMatrix","albedoMatrix","reflectivityColor","albedoColor","metallic","glossiness","vTangentSpaceParams","vBumpInfos","morphTargetInfluences","morphTargetCount","morphTargetTextureInfo","morphTargetTextureIndices","boneTextureWidth"];Re(de);class m{get normalsAreUnsigned(){return this._normalsAreUnsigned}_linkPrePassRenderer(e){this._linkedWithPrePass=!0,this._prePassRenderer=e,this._multiRenderTarget&&(this._multiRenderTarget.onClearObservable.clear(),this._multiRenderTarget.onClearObservable.add(()=>{}))}_unlinkPrePassRenderer(){this._linkedWithPrePass=!1,this._createRenderTargets()}_resetLayout(){this._enableDepth=!0,this._enableNormal=!0,this._enablePosition=!1,this._enableReflectivity=!1,this._enableVelocity=!1,this._enableVelocityLinear=!1,this._enableScreenspaceDepth=!1,this._attachmentsFromPrePass=[]}_forceTextureType(e,s){e===m.POSITION_TEXTURE_TYPE?(this._positionIndex=s,this._enablePosition=!0):e===m.VELOCITY_TEXTURE_TYPE?(this._velocityIndex=s,this._enableVelocity=!0):e===m.VELOCITY_LINEAR_TEXTURE_TYPE?(this._velocityLinearIndex=s,this._enableVelocityLinear=!0):e===m.REFLECTIVITY_TEXTURE_TYPE?(this._reflectivityIndex=s,this._enableReflectivity=!0):e===m.DEPTH_TEXTURE_TYPE?(this._depthIndex=s,this._enableDepth=!0):e===m.NORMAL_TEXTURE_TYPE?(this._normalIndex=s,this._enableNormal=!0):e===m.SCREENSPACE_DEPTH_TEXTURE_TYPE&&(this._screenspaceDepthIndex=s,this._enableScreenspaceDepth=!0)}_setAttachments(e){this._attachmentsFromPrePass=e}_linkInternalTexture(e){this._multiRenderTarget.setInternalTexture(e,0,!1)}get renderList(){return this._multiRenderTarget.renderList}set renderList(e){this._multiRenderTarget.renderList=e}get isSupported(){return this._multiRenderTarget.isSupported}getTextureIndex(e){switch(e){case m.POSITION_TEXTURE_TYPE:return this._positionIndex;case m.VELOCITY_TEXTURE_TYPE:return this._velocityIndex;case m.VELOCITY_LINEAR_TEXTURE_TYPE:return this._velocityLinearIndex;case m.REFLECTIVITY_TEXTURE_TYPE:return this._reflectivityIndex;case m.DEPTH_TEXTURE_TYPE:return this._depthIndex;case m.NORMAL_TEXTURE_TYPE:return this._normalIndex;case m.SCREENSPACE_DEPTH_TEXTURE_TYPE:return this._screenspaceDepthIndex;default:return-1}}get enableDepth(){return this._enableDepth}set enableDepth(e){this._enableDepth=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get enableNormal(){return this._enableNormal}set enableNormal(e){this._enableNormal=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get enablePosition(){return this._enablePosition}set enablePosition(e){this._enablePosition=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get enableVelocity(){return this._enableVelocity}set enableVelocity(e){this._enableVelocity=e,e||(this._previousTransformationMatrices={}),this._linkedWithPrePass||(this.dispose(),this._createRenderTargets()),this._scene.needsPreviousWorldMatrices=e}get enableVelocityLinear(){return this._enableVelocityLinear}set enableVelocityLinear(e){this._enableVelocityLinear=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get enableReflectivity(){return this._enableReflectivity}set enableReflectivity(e){this._enableReflectivity=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get enableScreenspaceDepth(){return this._enableScreenspaceDepth}set enableScreenspaceDepth(e){this._enableScreenspaceDepth=e,this._linkedWithPrePass||(this.dispose(),this._createRenderTargets())}get scene(){return this._scene}get ratio(){return typeof this._ratioOrDimensions=="object"?1:this._ratioOrDimensions}get shaderLanguage(){return this._shaderLanguage}constructor(e,s=1,i=15,t){this._previousTransformationMatrices={},this._previousBonesTransformationMatrices={},this.excludedSkinnedMeshesFromVelocity=[],this.renderTransparentMeshes=!0,this.generateNormalsInWorldSpace=!1,this._normalsAreUnsigned=!1,this._resizeObserver=null,this._enableDepth=!0,this._enableNormal=!0,this._enablePosition=!1,this._enableVelocity=!1,this._enableVelocityLinear=!1,this._enableReflectivity=!1,this._enableScreenspaceDepth=!1,this._clearColor=new se(0,0,0,0),this._clearDepthColor=new se(0,0,0,1),this._positionIndex=-1,this._velocityIndex=-1,this._velocityLinearIndex=-1,this._reflectivityIndex=-1,this._depthIndex=-1,this._normalIndex=-1,this._screenspaceDepthIndex=-1,this._linkedWithPrePass=!1,this.useSpecificClearForDepthTexture=!1,this._shaderLanguage=0,this._shadersLoaded=!1,this._scene=e,this._ratioOrDimensions=s,this._useUbo=e.getEngine().supportsUniformBuffers,this._depthFormat=i,this._textureTypesAndFormats=t||{},this._initShaderSourceAsync(),m._SceneComponentInitialization(this._scene),this._createRenderTargets()}async _initShaderSourceAsync(){this._scene.getEngine().isWebGPU&&!m.ForceGLSL?(this._shaderLanguage=1,await Promise.all([G(()=>import("./geometry.vertex-C5J6JgXf.js"),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),G(()=>import("./geometry.fragment-BxDvLGm1.js"),__vite__mapDeps([6,1,7,8,9]),import.meta.url)])):await Promise.all([G(()=>Promise.resolve().then(()=>Ce),void 0,import.meta.url),G(()=>Promise.resolve().then(()=>Le),void 0,import.meta.url)]),this._shadersLoaded=!0}isReady(e,s){if(!this._shadersLoaded)return!1;const i=e.getMaterial();if(i&&i.disableDepthWrite)return!1;const t=[],a=[P.PositionKind],l=e.getMesh();l.isVerticesDataPresent(P.NormalKind)&&(t.push("#define HAS_NORMAL_ATTRIBUTE"),a.push(P.NormalKind));let p=!1,x=!1;const o=!1;if(i){let u=!1;if(i.needAlphaTestingForMesh(l)&&i.getAlphaTestTexture()&&(t.push("#define ALPHATEST"),t.push(`#define ALPHATEST_UV${i.getAlphaTestTexture().coordinatesIndex+1}`),u=!0),(i.bumpTexture||i.normalTexture||i.geometryNormalTexture)&&ne.BumpTextureEnabled){const f=i.bumpTexture||i.normalTexture||i.geometryNormalTexture;t.push("#define BUMP"),t.push(`#define BUMP_UV${f.coordinatesIndex+1}`),u=!0}if(this._enableReflectivity){let f=!1;if(i.getClassName()==="PBRMetallicRoughnessMaterial")i.metallicRoughnessTexture&&(t.push("#define ORMTEXTURE"),t.push(`#define REFLECTIVITY_UV${i.metallicRoughnessTexture.coordinatesIndex+1}`),t.push("#define METALLICWORKFLOW"),u=!0,f=!0),i.metallic!=null&&(t.push("#define METALLIC"),t.push("#define METALLICWORKFLOW"),f=!0),i.roughness!=null&&(t.push("#define ROUGHNESS"),t.push("#define METALLICWORKFLOW"),f=!0),f&&(i.baseTexture&&(t.push("#define ALBEDOTEXTURE"),t.push(`#define ALBEDO_UV${i.baseTexture.coordinatesIndex+1}`),i.baseTexture.gammaSpace&&t.push("#define GAMMAALBEDO"),u=!0),i.baseColor&&t.push("#define ALBEDOCOLOR"));else if(i.getClassName()==="PBRSpecularGlossinessMaterial")i.specularGlossinessTexture?(t.push("#define SPECULARGLOSSINESSTEXTURE"),t.push(`#define REFLECTIVITY_UV${i.specularGlossinessTexture.coordinatesIndex+1}`),u=!0,i.specularGlossinessTexture.gammaSpace&&t.push("#define GAMMAREFLECTIVITYTEXTURE")):i.specularColor&&t.push("#define REFLECTIVITYCOLOR"),i.glossiness!=null&&t.push("#define GLOSSINESS");else if(i.getClassName()==="PBRMaterial")i.metallicTexture&&(t.push("#define ORMTEXTURE"),t.push(`#define REFLECTIVITY_UV${i.metallicTexture.coordinatesIndex+1}`),t.push("#define METALLICWORKFLOW"),u=!0,f=!0),i.metallic!=null&&(t.push("#define METALLIC"),t.push("#define METALLICWORKFLOW"),f=!0),i.roughness!=null&&(t.push("#define ROUGHNESS"),t.push("#define METALLICWORKFLOW"),f=!0),f?(i.albedoTexture&&(t.push("#define ALBEDOTEXTURE"),t.push(`#define ALBEDO_UV${i.albedoTexture.coordinatesIndex+1}`),i.albedoTexture.gammaSpace&&t.push("#define GAMMAALBEDO"),u=!0),i.albedoColor&&t.push("#define ALBEDOCOLOR")):(i.reflectivityTexture?(t.push("#define SPECULARGLOSSINESSTEXTURE"),t.push(`#define REFLECTIVITY_UV${i.reflectivityTexture.coordinatesIndex+1}`),i.reflectivityTexture.gammaSpace&&t.push("#define GAMMAREFLECTIVITYTEXTURE"),u=!0):i.reflectivityColor&&t.push("#define REFLECTIVITYCOLOR"),i.microSurface!=null&&t.push("#define GLOSSINESS"));else if(i.getClassName()==="StandardMaterial")i.specularTexture&&(t.push("#define REFLECTIVITYTEXTURE"),t.push(`#define REFLECTIVITY_UV${i.specularTexture.coordinatesIndex+1}`),i.specularTexture.gammaSpace&&t.push("#define GAMMAREFLECTIVITYTEXTURE"),u=!0),i.specularColor&&t.push("#define REFLECTIVITYCOLOR");else if(i.getClassName()==="OpenPBRMaterial"){const T=i;t.push("#define METALLICWORKFLOW"),t.push("#define METALLIC"),t.push("#define ROUGHNESS"),T._useRoughnessFromMetallicTextureGreen&&T.baseMetalnessTexture?(t.push("#define ORMTEXTURE"),t.push(`#define REFLECTIVITY_UV${T.baseMetalnessTexture.coordinatesIndex+1}`),u=!0):T.baseMetalnessTexture?(t.push("#define METALLIC_TEXTURE"),t.push(`#define METALLIC_UV${T.baseMetalnessTexture.coordinatesIndex+1}`),u=!0):T.specularRoughnessTexture&&(t.push("#define ROUGHNESS_TEXTURE"),t.push(`#define ROUGHNESS_UV${T.specularRoughnessTexture.coordinatesIndex+1}`),u=!0),T.baseColorTexture&&(t.push("#define ALBEDOTEXTURE"),t.push(`#define ALBEDO_UV${T.baseColorTexture.coordinatesIndex+1}`),T.baseColorTexture.gammaSpace&&t.push("#define GAMMAALBEDO"),u=!0),T.baseColor&&t.push("#define ALBEDOCOLOR")}}u&&(t.push("#define NEED_UV"),l.isVerticesDataPresent(P.UVKind)&&(a.push(P.UVKind),t.push("#define UV1"),p=!0),l.isVerticesDataPresent(P.UV2Kind)&&(a.push(P.UV2Kind),t.push("#define UV2"),x=!0))}this._enableDepth&&(t.push("#define DEPTH"),t.push("#define DEPTH_INDEX "+this._depthIndex)),this._enableNormal&&(t.push("#define NORMAL"),t.push("#define NORMAL_INDEX "+this._normalIndex)),this._enablePosition&&(t.push("#define POSITION"),t.push("#define POSITION_INDEX "+this._positionIndex)),this._enableVelocity&&(t.push("#define VELOCITY"),t.push("#define VELOCITY_INDEX "+this._velocityIndex),this.excludedSkinnedMeshesFromVelocity.indexOf(l)===-1&&t.push("#define BONES_VELOCITY_ENABLED")),this._enableVelocityLinear&&(t.push("#define VELOCITY_LINEAR"),t.push("#define VELOCITY_LINEAR_INDEX "+this._velocityLinearIndex),this.excludedSkinnedMeshesFromVelocity.indexOf(l)===-1&&t.push("#define BONES_VELOCITY_ENABLED")),this._enableReflectivity&&(t.push("#define REFLECTIVITY"),t.push("#define REFLECTIVITY_INDEX "+this._reflectivityIndex)),this._enableScreenspaceDepth&&this._screenspaceDepthIndex!==-1&&(t.push("#define SCREENSPACE_DEPTH_INDEX "+this._screenspaceDepthIndex),t.push("#define SCREENSPACE_DEPTH")),this.generateNormalsInWorldSpace&&t.push("#define NORMAL_WORLDSPACE"),this._normalsAreUnsigned&&t.push("#define ENCODE_NORMAL"),l.useBones&&l.computeBonesUsingShaders&&l.skeleton?(a.push(P.MatricesIndicesKind),a.push(P.MatricesWeightsKind),l.numBoneInfluencers>4&&(a.push(P.MatricesIndicesExtraKind),a.push(P.MatricesWeightsExtraKind)),t.push("#define NUM_BONE_INFLUENCERS "+l.numBoneInfluencers),t.push("#define BONETEXTURE "+l.skeleton.isUsingTextureForMatrices),t.push("#define BonesPerMesh "+(l.skeleton.bones.length+1))):(t.push("#define NUM_BONE_INFLUENCERS 0"),t.push("#define BONETEXTURE false"),t.push("#define BonesPerMesh 0"));const E=l.morphTargetManager?_e(l.morphTargetManager,t,a,l,!0,!0,!1,p,x,o):0;s&&(t.push("#define INSTANCES"),me(a,this._enableVelocity||this._enableVelocityLinear),e.getRenderingMesh().hasThinInstances&&t.push("#define THIN_INSTANCES")),this._linkedWithPrePass?t.push("#define SCENE_MRT_COUNT "+this._attachmentsFromPrePass.length):t.push("#define SCENE_MRT_COUNT "+this._multiRenderTarget.textures.length),pe(i,this._scene,t);const L=this._scene.getEngine(),C=e._getDrawWrapper(void 0,!0),B=C.defines,S=t.join(`
`);return B!==S&&C.setEffect(L.createEffect("geometry",{attributes:a,uniformsNames:de,samplers:["diffuseSampler","bumpSampler","reflectivitySampler","albedoSampler","morphTargets","boneSampler"],defines:S,onCompiled:null,fallbacks:null,onError:null,uniformBuffersNames:["Scene"],indexParameters:{buffersCount:this._multiRenderTarget.textures.length-1,maxSimultaneousMorphTargets:E},shaderLanguage:this.shaderLanguage},L),S),C.effect.isReady()}getGBuffer(){return this._multiRenderTarget}get samples(){return this._multiRenderTarget.samples}set samples(e){this._multiRenderTarget.samples=e}dispose(){var e,s;this._resizeObserver&&(this._scene.getEngine().onResizeObservable.remove(this._resizeObserver),this._resizeObserver=null),(e=this._multiRenderTarget)!=null&&e.renderTarget&&this.scene.getEngine()._currentRenderTarget===this._multiRenderTarget.renderTarget&&this.scene.getEngine().unBindFramebuffer((s=this._multiRenderTarget)==null?void 0:s.renderTarget),this.getGBuffer().dispose()}_assignRenderTargetIndices(){const e=[],s=[];let i=0;return this._enableDepth&&(this._depthIndex=i,i++,e.push("gBuffer_Depth"),s.push(this._textureTypesAndFormats[m.DEPTH_TEXTURE_TYPE])),this._enableNormal&&(this._normalIndex=i,i++,e.push("gBuffer_Normal"),s.push(this._textureTypesAndFormats[m.NORMAL_TEXTURE_TYPE])),this._enablePosition&&(this._positionIndex=i,i++,e.push("gBuffer_Position"),s.push(this._textureTypesAndFormats[m.POSITION_TEXTURE_TYPE])),this._enableVelocity&&(this._velocityIndex=i,i++,e.push("gBuffer_Velocity"),s.push(this._textureTypesAndFormats[m.VELOCITY_TEXTURE_TYPE])),this._enableVelocityLinear&&(this._velocityLinearIndex=i,i++,e.push("gBuffer_VelocityLinear"),s.push(this._textureTypesAndFormats[m.VELOCITY_LINEAR_TEXTURE_TYPE])),this._enableReflectivity&&(this._reflectivityIndex=i,i++,e.push("gBuffer_Reflectivity"),s.push(this._textureTypesAndFormats[m.REFLECTIVITY_TEXTURE_TYPE])),this._enableScreenspaceDepth&&(this._screenspaceDepthIndex=i,i++,e.push("gBuffer_ScreenspaceDepth"),s.push(this._textureTypesAndFormats[m.SCREENSPACE_DEPTH_TEXTURE_TYPE])),[i,e,s]}_createRenderTargets(){const e=this._scene.getEngine(),[s,i,t]=this._assignRenderTargetIndices();let a=0;e._caps.textureFloat&&e._caps.textureFloatLinearFiltering?a=1:e._caps.textureHalfFloat&&e._caps.textureHalfFloatLinearFiltering&&(a=2);const l=this._ratioOrDimensions.width!==void 0?this._ratioOrDimensions:{width:e.getRenderWidth()*this._ratioOrDimensions,height:e.getRenderHeight()*this._ratioOrDimensions},h=[],p=[];for(const u of t)u?(h.push(u.textureType),p.push(u.textureFormat)):(h.push(a),p.push(5));if(this._normalsAreUnsigned=h[m.NORMAL_TEXTURE_TYPE]===11||h[m.NORMAL_TEXTURE_TYPE]===13,this._multiRenderTarget=new Me("gBuffer",l,s,this._scene,{generateMipMaps:!1,generateDepthTexture:!0,types:h,formats:p,depthTextureFormat:this._depthFormat},i.concat("gBuffer_DepthBuffer")),!this.isSupported)return;this._multiRenderTarget.wrapU=W.CLAMP_ADDRESSMODE,this._multiRenderTarget.wrapV=W.CLAMP_ADDRESSMODE,this._multiRenderTarget.refreshRate=1,this._multiRenderTarget.renderParticles=!1,this._multiRenderTarget.renderList=null;const x=[!0],o=[!1],E=[!0];for(let u=1;u<s;++u)x.push(!0),E.push(!1),o.push(!0);const L=e.buildTextureLayout(x),C=e.buildTextureLayout(o),B=e.buildTextureLayout(E);this._multiRenderTarget.onClearObservable.add(u=>{u.bindAttachments(this.useSpecificClearForDepthTexture?C:L),u.clear(this._clearColor,!0,!0,!0),this.useSpecificClearForDepthTexture&&(u.bindAttachments(B),u.clear(this._clearDepthColor,!0,!0,!0)),u.bindAttachments(L)}),this._resizeObserver=e.onResizeObservable.add(()=>{if(this._multiRenderTarget){const u=this._ratioOrDimensions.width!==void 0?this._ratioOrDimensions:{width:e.getRenderWidth()*this._ratioOrDimensions,height:e.getRenderHeight()*this._ratioOrDimensions};this._multiRenderTarget.resize(u)}});const S=u=>{const f=u.getRenderingMesh(),T=u.getEffectiveMesh(),R=this._scene,g=R.getEngine(),n=u.getMaterial();if(!n)return;if(T._internalAbstractMeshDataInfo._isActiveIntermediate=!1,(this._enableVelocity||this._enableVelocityLinear)&&!this._previousTransformationMatrices[T.uniqueId]&&(this._previousTransformationMatrices[T.uniqueId]={world:Ee.Identity(),viewProjection:R.getTransformMatrix()},f.skeleton)){const v=f.skeleton.getTransformMatrices(f);this._previousBonesTransformationMatrices[f.uniqueId]=this._copyBonesTransformationMatrices(v,new Float32Array(v.length))}const A=f._getInstancesRenderList(u._id,!!u.getReplacementMesh());if(A.mustReturn)return;const U=g.getCaps().instancedArrays&&(A.visibleInstances[u._id]!==null||f.hasThinInstances),N=T.getWorldMatrix();if(this.isReady(u,U)){const v=u._getDrawWrapper();if(!v)return;const r=v.effect;g.enableEffect(v),U||f._bind(u,r,n.fillMode),this._useUbo?(ge(r,this._scene.getSceneUniformBuffer()),this._scene.finalizeSceneUbo()):(r.setMatrix("viewProjection",R.getTransformMatrix()),r.setMatrix("view",R.getViewMatrix()));let w;if(!f._instanceDataStorage.isFrozen&&(n.backFaceCulling||n.sideOrientation!==null)){const c=T._getWorldMatrixDeterminant();w=n._getEffectiveOrientation(f),c<0&&(w=w===q.ClockWiseSideOrientation?q.CounterClockWiseSideOrientation:q.ClockWiseSideOrientation)}else w=f._effectiveSideOrientation;if(n._preBind(v,w),n.needAlphaTestingForMesh(T)){const c=n.getAlphaTestTexture();c&&(r.setTexture("diffuseSampler",c),r.setMatrix("diffuseMatrix",c.getTextureMatrix()))}if((n.bumpTexture||n.normalTexture||n.geometryNormalTexture)&&R.getEngine().getCaps().standardDerivatives&&ne.BumpTextureEnabled){const c=n.bumpTexture||n.normalTexture||n.geometryNormalTexture;r.setFloat3("vBumpInfos",c.coordinatesIndex,1/c.level,n.parallaxScaleBias),r.setMatrix("bumpMatrix",c.getTextureMatrix()),r.setTexture("bumpSampler",c),r.setFloat2("vTangentSpaceParams",n.invertNormalMapX?-1:1,n.invertNormalMapY?-1:1)}if(this._enableReflectivity){if(n.getClassName()==="PBRMetallicRoughnessMaterial")n.metallicRoughnessTexture!==null&&(r.setTexture("reflectivitySampler",n.metallicRoughnessTexture),r.setMatrix("reflectivityMatrix",n.metallicRoughnessTexture.getTextureMatrix())),n.metallic!==null&&r.setFloat("metallic",n.metallic),n.roughness!==null&&r.setFloat("glossiness",1-n.roughness),n.baseTexture!==null&&(r.setTexture("albedoSampler",n.baseTexture),r.setMatrix("albedoMatrix",n.baseTexture.getTextureMatrix())),n.baseColor!==null&&r.setColor3("albedoColor",n.baseColor);else if(n.getClassName()==="PBRSpecularGlossinessMaterial")n.specularGlossinessTexture!==null?(r.setTexture("reflectivitySampler",n.specularGlossinessTexture),r.setMatrix("reflectivityMatrix",n.specularGlossinessTexture.getTextureMatrix())):n.specularColor!==null&&r.setColor3("reflectivityColor",n.specularColor),n.glossiness!==null&&r.setFloat("glossiness",n.glossiness);else if(n.getClassName()==="PBRMaterial")n.metallicTexture!==null&&(r.setTexture("reflectivitySampler",n.metallicTexture),r.setMatrix("reflectivityMatrix",n.metallicTexture.getTextureMatrix())),n.metallic!==null&&r.setFloat("metallic",n.metallic),n.roughness!==null&&r.setFloat("glossiness",1-n.roughness),n.roughness!==null||n.metallic!==null||n.metallicTexture!==null?(n.albedoTexture!==null&&(r.setTexture("albedoSampler",n.albedoTexture),r.setMatrix("albedoMatrix",n.albedoTexture.getTextureMatrix())),n.albedoColor!==null&&r.setColor3("albedoColor",n.albedoColor)):(n.reflectivityTexture!==null?(r.setTexture("reflectivitySampler",n.reflectivityTexture),r.setMatrix("reflectivityMatrix",n.reflectivityTexture.getTextureMatrix())):n.reflectivityColor!==null&&r.setColor3("reflectivityColor",n.reflectivityColor),n.microSurface!==null&&r.setFloat("glossiness",n.microSurface));else if(n.getClassName()==="StandardMaterial")n.specularTexture!==null&&(r.setTexture("reflectivitySampler",n.specularTexture),r.setMatrix("reflectivityMatrix",n.specularTexture.getTextureMatrix())),n.specularColor!==null&&r.setColor3("reflectivityColor",n.specularColor);else if(n.getClassName()==="OpenPBRMaterial"){const c=n;c._useRoughnessFromMetallicTextureGreen&&c.baseMetalnessTexture?(r.setTexture("reflectivitySampler",c.baseMetalnessTexture),r.setMatrix("reflectivityMatrix",c.baseMetalnessTexture.getTextureMatrix())):c.baseMetalnessTexture?(r.setTexture("metallicSampler",c.baseMetalnessTexture),r.setMatrix("metallicMatrix",c.baseMetalnessTexture.getTextureMatrix())):c.specularRoughnessTexture&&(r.setTexture("roughnessSampler",c.specularRoughnessTexture),r.setMatrix("roughnessMatrix",c.specularRoughnessTexture.getTextureMatrix())),r.setFloat("metallic",c.baseMetalness),r.setFloat("glossiness",1-c.specularRoughness),c.baseColorTexture!==null&&(r.setTexture("albedoSampler",c.baseColorTexture),r.setMatrix("albedoMatrix",c.baseColorTexture.getTextureMatrix())),c.baseColor!==null&&r.setColor3("albedoColor",c.baseColor)}}if(xe(r,n,this._scene),f.useBones&&f.computeBonesUsingShaders&&f.skeleton){const c=f.skeleton;if(c.isUsingTextureForMatrices&&r.getUniformIndex("boneTextureWidth")>-1){const O=c.getTransformMatrixTexture(f);r.setTexture("boneSampler",O),r.setFloat("boneTextureWidth",4*(c.bones.length+1))}else r.setMatrices("mBones",f.skeleton.getTransformMatrices(f));(this._enableVelocity||this._enableVelocityLinear)&&r.setMatrices("mPreviousBones",this._previousBonesTransformationMatrices[f.uniqueId])}ve(f,r),f.morphTargetManager&&f.morphTargetManager.isUsingTextureForTargets&&f.morphTargetManager._bind(r),(this._enableVelocity||this._enableVelocityLinear)&&(r.setMatrix("previousWorld",this._previousTransformationMatrices[T.uniqueId].world),r.setMatrix("previousViewProjection",this._previousTransformationMatrices[T.uniqueId].viewProjection)),U&&f.hasThinInstances&&r.setMatrix("world",N),f._processRendering(T,u,r,n.fillMode,A,U,(c,O)=>{c||r.setMatrix("world",O)})}(this._enableVelocity||this._enableVelocityLinear)&&(this._previousTransformationMatrices[T.uniqueId].world=N.clone(),this._previousTransformationMatrices[T.uniqueId].viewProjection=this._scene.getTransformMatrix().clone(),f.skeleton&&this._copyBonesTransformationMatrices(f.skeleton.getTransformMatrices(f),this._previousBonesTransformationMatrices[T.uniqueId]))};this._multiRenderTarget.customIsReadyFunction=(u,f,T)=>{if((T||f===0)&&u.subMeshes)for(let R=0;R<u.subMeshes.length;++R){const g=u.subMeshes[R],n=g.getMaterial(),A=g.getRenderingMesh();if(!n)continue;const U=A._getInstancesRenderList(g._id,!!g.getReplacementMesh()),N=e.getCaps().instancedArrays&&(U.visibleInstances[g._id]!==null||A.hasThinInstances);if(!this.isReady(g,N))return!1}return!0},this._multiRenderTarget.customRenderFunction=(u,f,T,R)=>{let g;if(this._linkedWithPrePass){if(!this._prePassRenderer.enabled)return;this._scene.getEngine().bindAttachments(this._attachmentsFromPrePass)}if(R.length){for(e.setColorWrite(!1),g=0;g<R.length;g++)S(R.data[g]);e.setColorWrite(!0)}for(g=0;g<u.length;g++)S(u.data[g]);for(e.setDepthWrite(!1),g=0;g<f.length;g++)S(f.data[g]);if(this.renderTransparentMeshes)for(g=0;g<T.length;g++)S(T.data[g]);e.setDepthWrite(!0)}}_copyBonesTransformationMatrices(e,s){for(let i=0;i<e.length;i++)s[i]=e[i];return s}}m.ForceGLSL=!1;m.DEPTH_TEXTURE_TYPE=0;m.NORMAL_TEXTURE_TYPE=1;m.POSITION_TEXTURE_TYPE=2;m.VELOCITY_TEXTURE_TYPE=3;m.REFLECTIVITY_TEXTURE_TYPE=4;m.SCREENSPACE_DEPTH_TEXTURE_TYPE=5;m.VELOCITY_LINEAR_TEXTURE_TYPE=6;m._SceneComponentInitialization=d=>{throw Ie("GeometryBufferRendererSceneComponent")};export{m as GeometryBufferRenderer};
