import React from "react";
import { IconButton } from "asc-web-components";
import { connect } from "react-redux";
import {
  setSharingPanelVisible,
  selectUploadedFile,
} from "../../../store/files/actions";
import {
  getSharePanelVisible,
  getUploadedFile,
} from "../../../store/files/selectors";

const ShareButton = (props) => {
  //console.log("Share button render");
  const { uploadedFile } = props;
  const isShared = uploadedFile[0].fileInfo
    ? uploadedFile[0].fileInfo.shared
    : false;
  let color = "#A3A9AE";
  if (isShared) color = "#657077";

  const onOpenSharingPanel = () => {
    const {
      setSharingPanelVisible,
      sharingPanelVisible,
      selectUploadedFile,
      uploadedFile,
    } = props;

    const file = uploadedFile[0].fileInfo;
    selectUploadedFile([file]);
    setSharingPanelVisible(!sharingPanelVisible);
  };

  return (
    <IconButton
      iconName="CatalogSharedIcon"
      className="upload_panel-icon"
      color={color}
      isClickable
      onClick={onOpenSharingPanel}
    />
  );
};

const mapStateToProps = (state, ownProps) => {
  const uniqueId = ownProps.uniqueId;

  return {
    sharingPanelVisible: getSharePanelVisible(state),
    uploadedFile: getUploadedFile(uniqueId)(state),
  };
};

export default connect(mapStateToProps, {
  setSharingPanelVisible,
  selectUploadedFile,
})(ShareButton);
