import React from "react";
import { Backdrop, Heading, Aside, IconButton } from "asc-web-components";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { utils as commonUtils } from "asc-web-common";
import {
  setUploadPanelVisible,
  cancelUpload,
  clearUploadData,
} from "../../../store/files/actions";
import {
  getUploadPanelVisible,
  getSharePanelVisible,
  isUploaded,
} from "../../../store/files/selectors";
import SharingPanel from "../SharingPanel";
import {
  StyledAsidePanel,
  StyledContent,
  StyledHeaderContent,
  StyledBody,
} from "../StyledPanels";
import FileList from "./FileList";

import { createI18N } from "../../../helpers/i18n";

const i18n = createI18N({
  page: "UploadPanel",
  localesPath: "panels/UploadPanel",
});
const { changeLanguage } = commonUtils;

const DownloadBodyStyle = { height: `calc(100vh - 62px)` };

class UploadPanelComponent extends React.Component {
  constructor(props) {
    super(props);

    changeLanguage(i18n);

    this.ref = React.createRef();
    this.scrollRef = React.createRef();
  }

  onClose = () => {
    const {
      setUploadPanelVisible,
      uploadPanelVisible,
      uploaded,
      clearUploadData,
    } = this.props;
    setUploadPanelVisible(!uploadPanelVisible);
    if (uploaded) {
      clearUploadData();
    }
  };
  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  onKeyPress = (event) => {
    if (event.key === "Esc" || event.key === "Escape") {
      this.onClose();
    }
  };

  clearUploadPanel = () => {
    this.props.clearUploadData();
    this.onClose();
  };

  render() {
    //console.log("UploadPanel render");
    const { t, uploadPanelVisible, sharingPanelVisible, uploaded } = this.props;

    const visible = uploadPanelVisible;
    const zIndex = 310;

    return (
      <StyledAsidePanel visible={visible}>
        <Backdrop
          onClick={this.onClose}
          visible={visible}
          zIndex={zIndex}
          isAside={true}
        />
        <Aside className="header_aside-panel" visible={visible}>
          <StyledContent>
            <StyledHeaderContent className="upload-panel_header-content">
              <Heading className="upload_panel-header" size="medium" truncate>
                {t("Uploads")}
              </Heading>
              <div className="upload_panel-icons-container">
                <div className="upload_panel-remove-icon">
                  {uploaded ? (
                    <IconButton
                      size="20"
                      iconName="ClearActiveIcon"
                      color="#A3A9AE"
                      isClickable={true}
                      onClick={this.clearUploadPanel}
                    />
                  ) : (
                    <IconButton
                      size="20"
                      iconName="ButtonCancelIcon"
                      color="#A3A9AE"
                      isClickable={true}
                      onClick={this.props.cancelUpload}
                    />
                  )}
                </div>
                {/*<div className="upload_panel-vertical-dots-icon">
                  <IconButton
                    size="20"
                    iconName="VerticalDotsIcon"
                    color="#A3A9AE"
                  />
                  </div>*/}
              </div>
            </StyledHeaderContent>
            <StyledBody
              stype="mediumBlack"
              className="upload-panel_body"
              style={DownloadBodyStyle}
            >
              <FileList />
            </StyledBody>
          </StyledContent>
        </Aside>
        {sharingPanelVisible && <SharingPanel />}
      </StyledAsidePanel>
    );
  }
}

const UploadPanelContainerTranslated = withTranslation()(UploadPanelComponent);

const UploadPanel = (props) => (
  <UploadPanelContainerTranslated i18n={i18n} {...props} />
);

const mapStateToProps = (state) => {
  //console.log("mapStateToProps");
  return {
    uploadPanelVisible: getUploadPanelVisible(state),
    sharingPanelVisible: getSharePanelVisible(state),
    uploaded: isUploaded(state),
  };
};

export default connect(mapStateToProps, {
  setUploadPanelVisible,
  cancelUpload,
  clearUploadData,
})(UploadPanel);
