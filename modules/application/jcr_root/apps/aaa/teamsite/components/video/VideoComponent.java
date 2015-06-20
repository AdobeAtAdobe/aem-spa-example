/*

<source src="movie1_1024_6.mp4" srctype="video/mp4" type="sbr" data-width="1024" data-videobitrate="6000" data-srctype="video/mp4">
<source src="movie_1024_1.mp4" srctype="video/mp4" type="sbr" data-width="1024" data-videobitrate="1000" data-srctype="video/mp4">
<source src="movie_360_6.mp4" srctype="video/mp4" type="sbr" data-width="360" data-videobitrate="6000" data-srctype="video/mp4">
<source src="movie_360_1.mp4" srctype="video/mp4" type="sbr" data-width="360" data-videobitrate="1000" data-srctype="video/mp4">
<source src="movie_1024_6.ogg" srctype="video/ogg" type="sbr" data-width="1024" data-videobitrate="6000" data-srctype="video/ogg">
<source src="movie_1024_1.ogg" srctype="video/ogg" type="sbr" data-width="1024" data-videobitrate="1000" data-srctype="video/ogg">
<source src="movie_360_6.ogg" srctype="video/ogg" type="sbr" data-width="360" data-videobitrate="6000" data-srctype="video/ogg">
<source src="movie_360_2.ogg" srctype="video/ogg" type="sbr" data-width="360" data-videobitrate="2000" data-srctype="video/ogg">

 */
package apps.aaa.teamsite.components.video;

import com.adobe.cq.sightly.WCMUse;
import com.day.cq.dam.api.Asset;
import com.day.cq.dam.api.Rendition;
import com.day.cq.dam.commons.util.DynamicMediaServicesConfigUtil;
import com.day.cq.dam.video.VideoProfile;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceUtil;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.resource.ResourceResolverFactory;
import com.adobe.cq.sightly.SightlyWCMMode;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

public class VideoComponent extends WCMUse {
    private final static String PROPERTY_AVS_PROXY_URL = "dam:proxyUrl";
    private Resource _referencedResourceContent = null;
    private Resource _metaDataResource = null;
    private Asset _referencedAsset = null;
    private Resource _referencedResource = null;
    private ValueMap _metaData = null;
    private String _thumbnailPath = "";
    private String _videoPath = "";
    private String _webmSrcPath = null;
    private String _oggSrcPath = null;
    private String _mp4SrcPath = null;
    private String[] _defaultVideoProfiles = {"firefoxhq", "iehq"};
    private List<String> _videoOutputSources = new ArrayList<String>();
    private String _previewVideoProxyUrl = "";
    private String _productionVideoProxyUrl = "";
    private boolean _hasAvsSet = false;
    private ResourceResolverFactory _resolverFactory;

    @Override
    public void activate() throws Exception {
        this._videoPath = this.getProperties().get("videoPath",String.class); //TODO: add support for you tube or vimeo
        if(this._videoPath != null) {
            this._referencedResource = this.getResourceResolver().resolve(this._videoPath);
            if(this._referencedResource != null){
                this._referencedAsset = this._referencedResource.adaptTo(Asset.class);
                this._referencedResourceContent = this._referencedResource.getChild("jcr:content");
                if(this._referencedResourceContent != null){
                    this._metaDataResource = this._referencedResourceContent.getChild("metadata");
                    if(this._metaDataResource != null) {
                        this._metaData = ResourceUtil.getValueMap(this._metaDataResource);
                    }
                }
            }
        };

        this.checkForAvsSet();

        if(this._hasAvsSet){
            this.getDynamicMediaEnpoints();
        }

        if(this._referencedAsset != null){
            this.setVideoProfileOuput();
        }
    }

    private void setVideoProfileOuput(){
        this._videoOutputSources = new ArrayList<String>();

        if(this._hasAvsSet){
            Iterator<Rendition> avsSetIterator =  this.getAvsRenditions().iterator();
            while(avsSetIterator.hasNext()) {
                Rendition thisRendition = avsSetIterator.next();
                String proxyUrl = "";
                if(this.getWcmMode().isEdit() || this.getWcmMode().isDesign()){
                    proxyUrl = this._previewVideoProxyUrl;
                }else{
                    proxyUrl = this._productionVideoProxyUrl;
                }

                //need a way to deal with high res low bandwidth
                this._videoOutputSources.add("<source src='" + proxyUrl + this.getAvsProxyUrl(thisRendition)+ "' type='sbr' data-width='"+this.getAvsRenditionWidth(thisRendition)+"' data-videobitrate='"+this.getAvsRenditionVideoBitrate(thisRendition)+"' data-srctype='"+thisRendition.getMimeType()+ "'/>");
            }

        }else{
            String[] videoProfileStrings = this.getCurrentStyle().get("profiles", this._defaultVideoProfiles);

            for (String profile : videoProfileStrings) {
                VideoProfile videoProfile = VideoProfile.get(this.getResourceResolver(), profile);

                if (videoProfile != null) {
                    Rendition rendition = videoProfile.getRendition(this._referencedAsset);
                    if (rendition != null) {
                        this._videoOutputSources.add("<source src='" + videoProfile.getHtmlSource(rendition) + "' type='" + videoProfile.getHtmlType() + "' />");
                    }
                }
            }
        }
    }

    private void getDynamicMediaEnpoints(){
        //Video Server URL
        String videoProxyServlet = DynamicMediaServicesConfigUtil.getServiceUrl(this.getResourceResolver());
        String videoRegistrationId = DynamicMediaServicesConfigUtil.getRegistrationId(this.getResourceResolver());
        if (videoRegistrationId != null && videoRegistrationId.contains("|")){
            videoRegistrationId = videoRegistrationId.substring(0, videoRegistrationId.indexOf("|"));
        }
        String videoPublicKey = DynamicMediaServicesConfigUtil.getPublicKey(this.getResourceResolver());
        if (videoProxyServlet != null) {
            if (!videoProxyServlet.endsWith("/")) {
                //add trailing /
                videoProxyServlet += "/";
            }
            if (videoRegistrationId != null) {
                this._previewVideoProxyUrl = videoProxyServlet + "private/" + videoRegistrationId;
            }
            if (videoPublicKey != null) {
                this._productionVideoProxyUrl = videoProxyServlet + "public/" + videoPublicKey;
            }
        }

        //adminResolver.close();
    }

    private List<Rendition> getAvsRenditions(){
        List<Rendition> renditionList = new ArrayList<Rendition>();
        Iterator<Rendition> renditionIterator = getRenditions();
        while(renditionIterator.hasNext()){
            Rendition thisRendition = renditionIterator.next();
            if(thisRendition.getName().contains(".dm.")){
                renditionList.add(thisRendition);
            }
        }

        return renditionList;
    }

    private void checkForAvsSet(){
        Iterator<Rendition> renditionIterator = getRenditions();
        while(renditionIterator.hasNext()){
            Rendition thisRendition = renditionIterator.next();
            if(thisRendition.getName().contains(".dm.")){
                this._hasAvsSet = true;
                break;
            }
        }
    }

    private String getAvsProxyUrl(Rendition rendition){
        ValueMap renditionValueMap = rendition.getChild("jcr:content").getValueMap();
        return renditionValueMap.get(PROPERTY_AVS_PROXY_URL,String.class);
    }

    public Long getAvsRenditionWidth(Rendition rendition){
        ValueMap renditionValueMap = rendition.getChild("jcr:content").getChild("metadata").getValueMap();
        return renditionValueMap.get("width",Long.class);
    }

    public String getAvsRenditionVideoCodec(Rendition rendition){
        ValueMap renditionValueMap = rendition.getChild("jcr:content").getChild("metadata").getValueMap();
        return renditionValueMap.get("videoCodec",String.class);
    }

    public String getAvsRenditionAudioCodec(Rendition rendition){
        ValueMap renditionValueMap = rendition.getChild("jcr:content").getChild("metadata").getValueMap();
        return renditionValueMap.get("audioCodec",String.class);
    }

    public Long getAvsRenditionVideoBitrate(Rendition rendition){
        ValueMap renditionValueMap = rendition.getChild("jcr:content").getChild("metadata").getValueMap();
        return renditionValueMap.get("videoBitrate",Long.class);
    }

    public boolean getHasAvsSet(){
        return this._hasAvsSet;
    }

    public String getVideoFormat() {
        if(this._metaData != null){
            return this._metaData.get("dc:format",String.class);
        }
        return "no format found in metadata";
    }

    public String getVideoBasePath() {
        if(this._videoPath != null){
            return this._videoPath;
        }else{
            return "";
        }
    }

    public String getReferencedResourcePath() {
        if(this._referencedResource != null){
            return this._referencedResource.getPath();
        }else{
            return "";
        }
    }

    public String getAssetName() {
        if(this._referencedAsset != null){
            return this._referencedAsset.getName();
        }else{
            return "";
        }
    }

    public String getWebMScrPath(){
        if(this._webmSrcPath == null && this._referencedAsset != null){
            VideoProfile videoProfile = VideoProfile.get(this.getResourceResolver(), "webm");
            if(videoProfile != null){
                Rendition rendition = videoProfile.getRendition(this._referencedAsset);
                if(rendition != null){
                    this._webmSrcPath = videoProfile.getHtmlSource(rendition);
                }
            }
        }

        return this._webmSrcPath;
    }

    public String getOggScrPath(){
        if(this._oggSrcPath == null && this._referencedAsset != null){
            VideoProfile videoProfile = VideoProfile.get(this.getResourceResolver(), "firefoxhq");
            if(videoProfile != null) {
                Rendition rendition = videoProfile.getRendition(this._referencedAsset);
                if (rendition != null) {
                    this._oggSrcPath = videoProfile.getHtmlSource(rendition);
                }
            }
        }

        return this._oggSrcPath;
    }

    public String getMp4ScrPath(){
        if(this._mp4SrcPath == null && this._referencedAsset != null){
            VideoProfile videoProfile = VideoProfile.get(this.getResourceResolver(), "iehq");
            if(videoProfile != null) {
                Rendition rendition = videoProfile.getRendition(this._referencedAsset);
                if (rendition != null) {
                    this._mp4SrcPath = videoProfile.getHtmlSource(rendition);
                }
            }
        }

        return this._mp4SrcPath;
    }

    public String getAutoPlay(){
        //we do this so the attribute disapears when not true
        String propValue = getProperties().get("autoplay", "false");
        if(propValue.equalsIgnoreCase("true")){
            return "true";
        }else{
            return "";
        }
    }

    public String getLoopVideo(){
        //we do this so the attribute disapears when not true
        String propValue = getProperties().get("loopVideo", "false");
        if(propValue.equalsIgnoreCase("true")){
            return "true";
        }else{
            return "";
        }
    }

    public String getShowControls(){
        //we do this so the attribute disapears when not true
        String propValue = getProperties().get("showControls", "false");
        if(propValue.equalsIgnoreCase("true")){
            return "true";
        }else{
            return "";
        }
    }

    public String getPosterImage(){
        //we do this so the attribute disapears when not true
        String propValue = getProperties().get("posterImage", "false");
        if(!propValue.equalsIgnoreCase("false")){
            return propValue;
        }else{
            return "";
        }
    }

    public List<String> getVideoSourceOutputs(){
        return this._videoOutputSources;
    }

    public String getWaypointStartWhenInView(){
        String propValue = getProperties().get("waypointVideoStart", "false");
        if(!propValue.equalsIgnoreCase("false")){
            return "true";
        }else{
            return "";//we do this so the attribute disapears when not true in sightly
        }
    }

    public String getWaypointStopWhenOutOfView(){
        String propValue = getProperties().get("waypointVideoStop", "false");
        if(!propValue.equalsIgnoreCase("false")){
            return "true";
        }else{
            return "";//we do this so the attribute disapears when not true in sightly
        }
    }

    public Iterator<Rendition> getRenditions(){
        return this._referencedAsset.listRenditions();
    }

    public String getPreviewVideoProxyUrl(){
        return this._previewVideoProxyUrl;
    }

    public String getProductionVideoProxyUrl(){
        return this._productionVideoProxyUrl;
    }
}