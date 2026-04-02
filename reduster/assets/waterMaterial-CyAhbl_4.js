import{S as _,f as F,g as L,C as v,h as y,M as u,i as S,j as g,k as U,l as V,m as B,n as W,E as G,H,o as z,c as m,p as j,q as P,A as k,r as X,s as K,t as Z,u as w,v as Y,w as $,x as q,T as b,y as J,z as Q,R as M,D as R,V as p,G as ee,J as A,K as ie,N as te,_ as a,U as re,W as h,X as C,Y as f,Z as oe,$ as ae}from"./index-DxYYIG04.js";const N="waterPixelShader",se=`#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;
#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<imageProcessingDeclaration>
#include<imageProcessingFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#ifdef BUMP
varying vec2 vNormalUV;
#ifdef BUMPSUPERIMPOSE
varying vec2 vNormalUV2;
#endif
uniform sampler2D normalSampler;uniform vec2 vNormalInfos;
#endif
uniform sampler2D refractionSampler;uniform sampler2D reflectionSampler;const float LOG2=1.442695;uniform vec3 cameraPosition;uniform vec4 waterColor;uniform float colorBlendFactor;uniform vec4 waterColor2;uniform float colorBlendFactor2;uniform float bumpHeight;uniform float time;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef BUMP
#ifdef BUMPSUPERIMPOSE
baseColor=0.6*texture2D(normalSampler,vNormalUV)+0.4*texture2D(normalSampler,vec2(vNormalUV2.x,vNormalUV2.y));
#else
baseColor=texture2D(normalSampler,vNormalUV);
#endif
vec3 bumpColor=baseColor.rgb;
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
baseColor.rgb*=vNormalInfos.y;
#else
vec3 bumpColor=vec3(1.0);
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec2 perturbation=bumpHeight*(baseColor.rg-0.5);
#ifdef BUMPAFFECTSREFLECTION
vec3 normalW=normalize(vNormalW+vec3(perturbation.x*8.0,0.0,perturbation.y*8.0));if (normalW.y<0.0) {normalW.y=-normalW.y;}
#else
vec3 normalW=normalize(vNormalW);
#endif
#else
vec3 normalW=vec3(1.0,1.0,1.0);vec2 perturbation=bumpHeight*(vec2(1.0,1.0)-0.5);
#endif
#ifdef FRESNELSEPARATE
#ifdef REFLECTION
vec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation*0.5,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);
#ifdef IS_REFRACTION_LINEAR
refractiveColor.rgb=toGammaSpace(refractiveColor.rgb);
#endif
vec2 projectedReflectionTexCoords=vec2(
vReflectionMapTexCoord.x/vReflectionMapTexCoord.z+perturbation.x*0.3,
vReflectionMapTexCoord.y/vReflectionMapTexCoord.z+perturbation.y
);vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);
#ifdef IS_REFLECTION_LINEAR
reflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);
#endif
vec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=clamp(abs(pow(dot(viewDirectionW,upVector),3.0)),0.05,0.65);float IfresnelTerm=1.0-fresnelTerm;refractiveColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*refractiveColor;reflectiveColor=IfresnelTerm*colorBlendFactor2*waterColor+(1.0-colorBlendFactor2*IfresnelTerm)*reflectiveColor;vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*IfresnelTerm;baseColor=combinedColor;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
#include<lightFragment>[0..maxSimultaneousLights]
vec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
#else 
#ifdef REFLECTION
vec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);
#ifdef IS_REFRACTION_LINEAR
refractiveColor.rgb=toGammaSpace(refractiveColor.rgb);
#endif
vec2 projectedReflectionTexCoords=vReflectionMapTexCoord.xy/vReflectionMapTexCoord.z+perturbation;vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);
#ifdef IS_REFLECTION_LINEAR
reflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);
#endif
vec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=max(dot(viewDirectionW,upVector),0.0);vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*(1.0-fresnelTerm);baseColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*combinedColor;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
#include<lightFragment>[0..maxSimultaneousLights]
vec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
#endif
vec4 color=vec4(finalDiffuse+finalSpecular,alpha);
#include<logDepthFragment>
#include<fogFragment>
#ifdef IMAGEPROCESSINGPOSTPROCESS
color.rgb=toLinearSpace(color.rgb);
#elif defined(IMAGEPROCESSING)
color.rgb=toLinearSpace(color.rgb);color=applyImageProcessing(color);
#endif
gl_FragColor=color;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;_.ShadersStore[N]||(_.ShadersStore[N]=se);const O="waterVertexShader",ne=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef BUMP
varying vec2 vNormalUV;
#ifdef BUMPSUPERIMPOSE
varying vec2 vNormalUV2;
#endif
uniform mat4 normalMatrix;uniform vec2 vNormalInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<logDepthDeclaration>
uniform mat4 reflectionViewProjection;uniform vec2 windDirection;uniform float waveLength;uniform float time;uniform float windForce;uniform float waveHeight;uniform float waveSpeed;uniform float waveCount;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef BUMP
if (vNormalInfos.x==0.)
{vNormalUV=vec2(normalMatrix*vec4((uv*1.0)/waveLength+time*windForce*windDirection,1.0,0.0));
#ifdef BUMPSUPERIMPOSE
vNormalUV2=vec2(normalMatrix*vec4((uv*0.721)/waveLength+time*1.2*windForce*windDirection,1.0,0.0));
#endif
}
else
{vNormalUV=vec2(normalMatrix*vec4((uv2*1.0)/waveLength+time*windForce*windDirection ,1.0,0.0));
#ifdef BUMPSUPERIMPOSE
vNormalUV2=vec2(normalMatrix*vec4((uv2*0.721)/waveLength+time*1.2*windForce*windDirection ,1.0,0.0));
#endif
}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
float finalWaveCount=1.0/(waveCount*0.5);
#ifdef USE_WORLD_COORDINATES
vec3 p=worldPos.xyz;
#else
vec3 p=position;
#endif
float newY=(sin(((p.x/finalWaveCount)+time*waveSpeed))*waveHeight*windDirection.x*5.0)
+ (cos(((p.z/finalWaveCount)+ time*waveSpeed))*waveHeight*windDirection.y*5.0);p.y+=abs(newY);
#ifdef USE_WORLD_COORDINATES
gl_Position=viewProjection*vec4(p,1.0);
#else
gl_Position=viewProjection*finalWorld*vec4(p,1.0);
#endif
#ifdef REFLECTION
vRefractionMapTexCoord.x=0.5*(gl_Position.w+gl_Position.x);vRefractionMapTexCoord.y=0.5*(gl_Position.w+gl_Position.y);vRefractionMapTexCoord.z=gl_Position.w;worldPos=reflectionViewProjection*finalWorld*vec4(position,1.0);vReflectionMapTexCoord.x=0.5*(worldPos.w+worldPos.x);vReflectionMapTexCoord.y=0.5*(worldPos.w+worldPos.y);vReflectionMapTexCoord.z=worldPos.w;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`;_.ShadersStore[O]||(_.ShadersStore[O]=ne);class le extends te{constructor(){super(),this.BUMP=!1,this.REFLECTION=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.SPECULARTERM=!1,this.LOGARITHMICDEPTH=!1,this.USE_REVERSE_DEPTHBUFFER=!1,this.FRESNELSEPARATE=!1,this.BUMPSUPERIMPOSE=!1,this.BUMPAFFECTSREFLECTION=!1,this.USE_WORLD_COORDINATES=!1,this.IMAGEPROCESSING=!1,this.VIGNETTE=!1,this.VIGNETTEBLENDMODEMULTIPLY=!1,this.VIGNETTEBLENDMODEOPAQUE=!1,this.TONEMAPPING=0,this.CONTRAST=!1,this.EXPOSURE=!1,this.COLORCURVES=!1,this.COLORGRADING=!1,this.COLORGRADING3D=!1,this.SAMPLER3DGREENDEPTH=!1,this.SAMPLER3DBGRMAP=!1,this.DITHER=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.rebuild()}}class r extends F{get hasRenderTargetTextures(){return!0}constructor(e,t,l=new L(512,512)){super(e,t),this.renderTargetSize=l,this.diffuseColor=new v(1,1,1),this.specularColor=new v(0,0,0),this.specularPower=64,this._disableLighting=!1,this._maxSimultaneousLights=4,this.windForce=6,this.windDirection=new L(0,1),this.waveHeight=.4,this.bumpHeight=.4,this._bumpSuperimpose=!1,this._fresnelSeparate=!1,this._bumpAffectsReflection=!1,this.waterColor=new v(.1,.1,.6),this.colorBlendFactor=.2,this.waterColor2=new v(.1,.1,.6),this.colorBlendFactor2=.2,this.waveLength=.1,this.waveSpeed=1,this.waveCount=20,this.disableClipPlane=!1,this._useWorldCoordinatesForWaveDeformation=!1,this._renderTargets=new y(16),this._mesh=null,this._reflectionTransform=u.Zero(),this._offsetMirror=u.Zero(),this._tempPlane=new S(0,0,0,0),this._lastTime=0,this._lastDeltaTime=0,this._createRenderTargets(this.getScene(),l),this.getRenderTargetTextures=()=>(this._renderTargets.reset(),this._renderTargets.push(this._reflectionRTT),this._renderTargets.push(this._refractionRTT),this._renderTargets),this._imageProcessingConfiguration=this.getScene().imageProcessingConfiguration,this._imageProcessingConfiguration&&(this._imageProcessingObserver=this._imageProcessingConfiguration.onUpdateParameters.add(()=>{this._markAllSubMeshesAsImageProcessingDirty()}))}get refractionTexture(){return this._refractionRTT}get reflectionTexture(){return this._reflectionRTT}addToRenderList(e){this._refractionRTT&&this._refractionRTT.renderList&&this._refractionRTT.renderList.push(e),this._reflectionRTT&&this._reflectionRTT.renderList&&this._reflectionRTT.renderList.push(e)}removeFromRenderList(e){if(this._refractionRTT&&this._refractionRTT.renderList){const t=this._refractionRTT.renderList.indexOf(e);t!==-1&&this._refractionRTT.renderList.splice(t,1)}if(this._reflectionRTT&&this._reflectionRTT.renderList){const t=this._reflectionRTT.renderList.indexOf(e);t!==-1&&this._reflectionRTT.renderList.splice(t,1)}}enableRenderTargets(e){const t=e?1:0;this._refractionRTT&&(this._refractionRTT.refreshRate=t),this._reflectionRTT&&(this._reflectionRTT.refreshRate=t)}getRenderList(){return this._refractionRTT?this._refractionRTT.renderList:[]}get renderTargetsEnabled(){return!(this._refractionRTT&&this._refractionRTT.refreshRate===0)}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,l){const o=t._drawWrapper;if(this.isFrozen&&o.effect&&o._wasPreviouslyReady&&o._wasPreviouslyUsingInstances===l)return!0;t.materialDefines||(t.materialDefines=new le);const i=t.materialDefines,s=this.getScene();if(this._isReadyForSubMesh(t))return!0;const c=s.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,s.texturesEnabled)){if(this.bumpTexture&&g.BumpTextureEnabled)if(this.bumpTexture.isReady())i._needUVs=!0,i.BUMP=!0;else return!1;g.ReflectionTextureEnabled&&(i.REFLECTION=!0)}if(U(s,c,this,i,!!l),V(e,s,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i,void 0,void 0,void 0,this._isVertexOutputInvariant),i._areMiscDirty&&(i.FRESNELSEPARATE=this._fresnelSeparate,i.BUMPSUPERIMPOSE=this._bumpSuperimpose,i.BUMPAFFECTSREFLECTION=this._bumpAffectsReflection,i.USE_WORLD_COORDINATES=this._useWorldCoordinatesForWaveDeformation),i._needNormals=B(s,e,i,!0,this._maxSimultaneousLights,this._disableLighting),i._areImageProcessingDirty&&this._imageProcessingConfiguration){if(!this._imageProcessingConfiguration.isReady())return!1;this._imageProcessingConfiguration.prepareDefines(i),i.IS_REFLECTION_LINEAR=this.reflectionTexture!=null&&!this.reflectionTexture.gammaSpace,i.IS_REFRACTION_LINEAR=this.refractionTexture!=null&&!this.refractionTexture.gammaSpace}if(W(e,i,!0,!0),this._mesh=e,this._waitingRenderList){for(let n=0;n<this._waitingRenderList.length;n++)this.addToRenderList(s.getNodeById(this._waitingRenderList[n]));this._waitingRenderList=null}if(i.isDirty){i.markAsProcessed(),s.resetCachedMaterial();const n=new G;i.FOG&&n.addFallback(1,"FOG"),i.LOGARITHMICDEPTH&&n.addFallback(0,"LOGARITHMICDEPTH"),H(i,n,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&n.addCPUSkinningFallback(0,e);const d=[m.PositionKind];i.NORMAL&&d.push(m.NormalKind),i.UV1&&d.push(m.UVKind),i.UV2&&d.push(m.UV2Kind),i.VERTEXCOLOR&&d.push(m.ColorKind),z(d,e,i,n),j(d,i);const I="water",D=i.toString(),T=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vSpecularColor","vFogInfos","vFogColor","pointSize","vNormalInfos","mBones","normalMatrix","logarithmicDepthConstant","reflectionViewProjection","windDirection","waveLength","time","windForce","cameraPosition","bumpHeight","waveHeight","waterColor","waterColor2","colorBlendFactor","colorBlendFactor2","waveSpeed","waveCount"],E=["normalSampler","refractionSampler","reflectionSampler"],x=[];P&&(P.PrepareUniforms(T,i),P.PrepareSamplers(E,i)),k(T),X({uniformsNames:T,uniformBuffersNames:x,samplers:E,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(s.getEngine().createEffect(I,{attributes:d,uniformsNames:T,uniformBuffersNames:x,samplers:E,defines:D,fallbacks:n,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this._maxSimultaneousLights}},c),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=s.getRenderId(),o._wasPreviouslyReady=!0,o._wasPreviouslyUsingInstances=!!l,!0)}bindForSubMesh(e,t,l){const o=this.getScene(),i=l.materialDefines;if(!i)return;const s=l.effect;if(!s||!this._mesh)return;this._activeEffect=s,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",o.getTransformMatrix()),K(t,this._activeEffect),this._mustRebind(o,s,l)&&(this.bumpTexture&&g.BumpTextureEnabled&&(this._activeEffect.setTexture("normalSampler",this.bumpTexture),this._activeEffect.setFloat2("vNormalInfos",this.bumpTexture.coordinatesIndex,this.bumpTexture.level),this._activeEffect.setMatrix("normalMatrix",this.bumpTexture.getTextureMatrix())),Z(s,this,o),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&w(i,s,o),o.bindEyePosition(s)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),i.SPECULARTERM&&this._activeEffect.setColor4("vSpecularColor",this.specularColor,this.specularPower),o.lightsEnabled&&!this.disableLighting&&Y(o,t,this._activeEffect,i,this.maxSimultaneousLights),o.fogEnabled&&t.applyFog&&o.fogMode!==$.FOGMODE_NONE&&this._activeEffect.setMatrix("view",o.getViewMatrix()),q(o,t,this._activeEffect),w(i,this._activeEffect,o),g.ReflectionTextureEnabled&&(this._activeEffect.setTexture("refractionSampler",this._refractionRTT),this._activeEffect.setTexture("reflectionSampler",this._reflectionRTT));const c=b.Matrix[3].copyFrom(this._reflectionTransform);if(o.floatingOriginMode){const d=J(o.floatingOriginOffset,o.getViewMatrix(),b.Matrix[1]);Q(this._offsetMirror,d,c)}c.multiplyToRef(o.getProjectionMatrix(),c);const n=o.getEngine().getDeltaTime();n!==this._lastDeltaTime&&(this._lastDeltaTime=n,this._lastTime+=this._lastDeltaTime),this._activeEffect.setMatrix("reflectionViewProjection",c),this._activeEffect.setVector2("windDirection",this.windDirection),this._activeEffect.setFloat("waveLength",this.waveLength),this._activeEffect.setFloat("time",this._lastTime/1e5),this._activeEffect.setFloat("windForce",this.windForce),this._activeEffect.setFloat("waveHeight",this.waveHeight),this._activeEffect.setFloat("bumpHeight",this.bumpHeight),this._activeEffect.setColor4("waterColor",this.waterColor,1),this._activeEffect.setFloat("colorBlendFactor",this.colorBlendFactor),this._activeEffect.setColor4("waterColor2",this.waterColor2,1),this._activeEffect.setFloat("colorBlendFactor2",this.colorBlendFactor2),this._activeEffect.setFloat("waveSpeed",this.waveSpeed),this._activeEffect.setFloat("waveCount",this.waveCount),this._imageProcessingConfiguration&&!this._imageProcessingConfiguration.applyByPostProcess&&this._imageProcessingConfiguration.bind(this._activeEffect),this._afterBind(t,this._activeEffect,l)}_createRenderTargets(e,t){this._refractionRTT=new M(name+"_refraction",{width:t.x,height:t.y},e,!1,!0),this._refractionRTT.wrapU=R.TEXTURE_MIRROR_ADDRESSMODE,this._refractionRTT.wrapV=R.TEXTURE_MIRROR_ADDRESSMODE,this._refractionRTT.ignoreCameraViewport=!0;let l=!1;this._refractionRTT.onBeforeRenderObservable.add(()=>{l=e.getBoundingBoxRenderer().enabled,e.getBoundingBoxRenderer().enabled=!1}),this._refractionRTT.onAfterRenderObservable.add(()=>{e.getBoundingBoxRenderer().enabled=l}),this._reflectionRTT=new M(name+"_reflection",{width:t.x,height:t.y},e,!1,!0),this._reflectionRTT.wrapU=R.TEXTURE_MIRROR_ADDRESSMODE,this._reflectionRTT.wrapV=R.TEXTURE_MIRROR_ADDRESSMODE,this._reflectionRTT.ignoreCameraViewport=!0;let o,i=null,s;const c=u.Zero();this._refractionRTT.onBeforeRender=()=>{if(this._mesh&&(o=this._mesh.isVisible,this._mesh.isVisible=!1),!this.disableClipPlane){i=e.clipPlane;const n=this._mesh?this._mesh.absolutePosition.y:0;e.clipPlane=S.FromPositionAndNormal(new p(0,n+.05,0),new p(0,1,0))}},this._refractionRTT.onAfterRender=()=>{this._mesh&&(this._mesh.isVisible=o),this.disableClipPlane||(e.clipPlane=i)},this._reflectionRTT.onBeforeRender=()=>{if(this._mesh&&(o=this._mesh.isVisible,this._mesh.isVisible=!1),!this.disableClipPlane){i=e.clipPlane;const d=this._mesh?this._mesh.absolutePosition.y:0;e.clipPlane=S.FromPositionAndNormal(new p(0,d-.05,0),new p(0,-1,0)),u.ReflectionToRef(e.clipPlane,c),this._offsetMirror.copyFrom(c),e.floatingOriginMode&&(ee(e.floatingOriginOffset,e.clipPlane,this._tempPlane),u.ReflectionToRef(this._tempPlane,this._offsetMirror))}s=e.getViewMatrix(),c.multiplyToRef(s,this._reflectionTransform),e.setTransformMatrix(this._reflectionTransform,e.getProjectionMatrix());const n=p.TransformCoordinates(e.activeCamera.position,c);e._mirroredCameraPosition=n,e._forcedViewPosition=n},this._reflectionRTT.onAfterRender=()=>{this._mesh&&(this._mesh.isVisible=o),e.clipPlane=i,e.setTransformMatrix(s,e.getProjectionMatrix()),e._mirroredCameraPosition=null,e._forcedViewPosition=null}}getAnimatables(){const e=[];return this.bumpTexture&&this.bumpTexture.animations&&this.bumpTexture.animations.length>0&&e.push(this.bumpTexture),this._reflectionRTT&&this._reflectionRTT.animations&&this._reflectionRTT.animations.length>0&&e.push(this._reflectionRTT),this._refractionRTT&&this._refractionRTT.animations&&this._refractionRTT.animations.length>0&&e.push(this._refractionRTT),e}getActiveTextures(){const e=super.getActiveTextures();return this._bumpTexture&&e.push(this._bumpTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this._bumpTexture===e)}dispose(e){this.bumpTexture&&this.bumpTexture.dispose();let t=this.getScene().customRenderTargets.indexOf(this._refractionRTT);t!=-1&&this.getScene().customRenderTargets.splice(t,1),t=this.getScene().customRenderTargets.indexOf(this._reflectionRTT),t!=-1&&this.getScene().customRenderTargets.splice(t,1),this._reflectionRTT&&this._reflectionRTT.dispose(),this._refractionRTT&&this._refractionRTT.dispose(),this._imageProcessingConfiguration&&this._imageProcessingObserver&&this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver),super.dispose(e)}clone(e){return A.Clone(()=>new r(e,this.getScene()),this)}serialize(){const e=super.serialize();if(e.customType="BABYLON.WaterMaterial",e.renderList=[],this._refractionRTT&&this._refractionRTT.renderList)for(let t=0;t<this._refractionRTT.renderList.length;t++)e.renderList.push(this._refractionRTT.renderList[t].id);return e}getClassName(){return"WaterMaterial"}static Parse(e,t,l){const o=A.Parse(()=>new r(e.name,t),e,t,l);return o._waitingRenderList=e.renderList,o}static CreateDefaultMesh(e,t){return ie(e,{width:512,height:512,subdivisions:32,updatable:!1},t)}}a([re("bumpTexture")],r.prototype,"_bumpTexture",void 0);a([h("_markAllSubMeshesAsTexturesDirty")],r.prototype,"bumpTexture",void 0);a([C()],r.prototype,"diffuseColor",void 0);a([C()],r.prototype,"specularColor",void 0);a([f()],r.prototype,"specularPower",void 0);a([f("disableLighting")],r.prototype,"_disableLighting",void 0);a([h("_markAllSubMeshesAsLightsDirty")],r.prototype,"disableLighting",void 0);a([f("maxSimultaneousLights")],r.prototype,"_maxSimultaneousLights",void 0);a([h("_markAllSubMeshesAsLightsDirty")],r.prototype,"maxSimultaneousLights",void 0);a([f()],r.prototype,"windForce",void 0);a([oe()],r.prototype,"windDirection",void 0);a([f()],r.prototype,"waveHeight",void 0);a([f()],r.prototype,"bumpHeight",void 0);a([f("bumpSuperimpose")],r.prototype,"_bumpSuperimpose",void 0);a([h("_markAllSubMeshesAsMiscDirty")],r.prototype,"bumpSuperimpose",void 0);a([f("fresnelSeparate")],r.prototype,"_fresnelSeparate",void 0);a([h("_markAllSubMeshesAsMiscDirty")],r.prototype,"fresnelSeparate",void 0);a([f("bumpAffectsReflection")],r.prototype,"_bumpAffectsReflection",void 0);a([h("_markAllSubMeshesAsMiscDirty")],r.prototype,"bumpAffectsReflection",void 0);a([C()],r.prototype,"waterColor",void 0);a([f()],r.prototype,"colorBlendFactor",void 0);a([C()],r.prototype,"waterColor2",void 0);a([f()],r.prototype,"colorBlendFactor2",void 0);a([f()],r.prototype,"waveLength",void 0);a([f()],r.prototype,"waveSpeed",void 0);a([f()],r.prototype,"waveCount",void 0);a([f()],r.prototype,"disableClipPlane",void 0);a([f("useWorldCoordinatesForWaveDeformation")],r.prototype,"_useWorldCoordinatesForWaveDeformation",void 0);a([h("_markAllSubMeshesAsMiscDirty")],r.prototype,"useWorldCoordinatesForWaveDeformation",void 0);ae("BABYLON.WaterMaterial",r);export{r as WaterMaterial};
