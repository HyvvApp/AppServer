import { api, history, constants, store } from "asc-web-common";
import axios from "axios";
import queryString from "query-string";
import {
  AUTHOR_TYPE,
  FILTER_TYPE,
  PAGE_COUNT,
  PAGE,
  SEARCH_TYPE,
  SEARCH,
  SORT_BY,
  SORT_ORDER,
  FOLDER,
  PREVIEW,
  TIMEOUT,
} from "../../helpers/constants";
import config from "../../../package.json";
import {
  createTreeFolders,
  canConvert,
  loopTreeFolders,
  getSelectedFolderId,
  getFilter,
  getIsRecycleBinFolder,
  /*getPrimaryProgressData,*/
  getSecondaryProgressData,
  getTreeFolders,
  getSettingsTree,
  getPrivacyFolder,
  getVerHistoryFileId,
  getFileVersions,
} from "./selectors";

import sumBy from "lodash/sumBy";
import throttle from "lodash/throttle";
import uniqueid from "lodash/uniqueId";

const { files, FilesFilter } = api;
const { FolderType } = constants;
const { isEncryptionSupport } = store.auth.selectors;

export const SET_FOLDER = "SET_FOLDER";
export const SET_FOLDERS = "SET_FOLDERS";
export const SET_FILE = "SET_FILE";
export const SET_FILES = "SET_FILES";
export const SET_SELECTION = "SET_SELECTION";
export const SET_SELECTED = "SET_SELECTED";
export const SET_SELECTED_FOLDER = "SET_SELECTED_FOLDER";
export const SET_TREE_FOLDERS = "SET_TREE_FOLDERS";
export const SET_FILES_FILTER = "SET_FILES_FILTER";
export const SET_FILTER = "SET_FILTER";
export const SELECT_FILE = "SELECT_FILE";
export const DESELECT_FILE = "DESELECT_FILE";
export const SET_ACTION = "SET_ACTION";
export const SET_DRAGGING = "SET_DRAGGING";
export const SET_DRAG_ITEM = "SET_DRAG_ITEM";
export const SET_MEDIA_VIEWER_VISIBLE = "SET_MEDIA_VIEWER_VISIBLE";
export const SET_PRIMARY_PROGRESS_BAR_DATA = "SET_PRIMARY_PROGRESS_BAR_DATA";
export const SET_SECONDARY_PROGRESS_BAR_DATA =
  "SET_SECONDARY_PROGRESS_BAR_DATA";
export const SET_VIEW_AS = "SET_VIEW_AS";
export const SET_CONVERT_DIALOG_VISIBLE = "SET_CONVERT_DIALOG_VISIBLE";
export const SET_SHARING_PANEL_VISIBLE = "SET_SHARING_PANEL_VISIBLE";
export const SET_UPLOAD_PANEL_VISIBLE = "SET_UPLOAD_PANEL_VISIBLE";
export const SET_UPDATE_TREE = "SET_UPDATE_TREE";
export const SET_NEW_ROW_ITEMS = "SET_NEW_ROW_ITEMS";
export const SET_SELECTED_NODE = "SET_SELECTED_NODE";
export const SET_EXPAND_SETTINGS_TREE = "SET_EXPAND_SETTINGS_TREE";
export const SET_IS_LOADING = "SET_IS_LOADING";
export const SET_THIRD_PARTY = "SET_THIRD_PARTY";
export const SET_FILES_SETTINGS = "SET_FILES_SETTINGS";
export const SET_FILES_SETTING = "SET_FILES_SETTING";
export const SET_IS_ERROR_SETTINGS = "SET_IS_ERROR_SETTINGS";
export const SET_FIRST_LOAD = "SET_FIRST_LOAD";
export const SET_UPLOAD_DATA = "SET_UPLOAD_DATA";
export const SET_THIRDPARTY_CAPABILITIES = "SET_THIRDPARTY_CAPABILITIES";
export const SET_THIRDPARTY_PROVIDERS = "SET_THIRDPARTY_PROVIDERS";
export const SET_CONNECT_ITEM = "SET_CONNECT_ITEM";
export const SET_SHOW_THIRDPARTY_PANEL = "SET_SHOW_THIRDPARTY_PANEL";
export const SET_IS_VER_HISTORY_PANEL = "SET_IS_VER_HISTORY_PANEL";
export const SET_VER_HISTORY_FILE_ID = "SET_VER_HISTORY_FILE_ID";
export const SET_FILE_VERSIONS = "SET_FILE_VERSIONS";
export const SET_CHANGE_OWNER_VISIBLE = "SET_CHANGE_OWNER_VISIBLE";
export const SELECT_UPLOADED_FILE = "SELECT_UPLOADED_FILE";
export const UPDATE_UPLOADED_FILE = "UPDATE_UPLOADED_FILE";

export function setFile(file) {
  return {
    type: SET_FILE,
    file,
  };
}

export function setFiles(files) {
  return {
    type: SET_FILES,
    files,
  };
}

export function setFolder(folder) {
  return {
    type: SET_FOLDER,
    folder,
  };
}

export function setFolders(folders) {
  return {
    type: SET_FOLDERS,
    folders,
  };
}

export function setSelection(selection) {
  return {
    type: SET_SELECTION,
    selection,
  };
}

export function setSelected(selected) {
  return {
    type: SET_SELECTED,
    selected,
  };
}

export function setAction(fileAction) {
  return {
    type: SET_ACTION,
    fileAction,
  };
}

export function setSelectedFolder(selectedFolder) {
  return {
    type: SET_SELECTED_FOLDER,
    selectedFolder,
  };
}

export function setTreeFolders(treeFolders) {
  return {
    type: SET_TREE_FOLDERS,
    treeFolders,
  };
}

export function setDragging(dragging) {
  return {
    type: SET_DRAGGING,
    dragging,
  };
}

export function setDragItem(dragItem) {
  return {
    type: SET_DRAG_ITEM,
    dragItem,
  };
}

export function setFilesFilter(filter) {
  setFilterUrl(filter);
  return {
    type: SET_FILES_FILTER,
    filter,
  };
}
export function setFilter(filter) {
  return {
    type: SET_FILTER,
    filter,
  };
}

export function setViewAs(viewAs) {
  return {
    type: SET_VIEW_AS,
    viewAs,
  };
}

export function selectFile(file) {
  return {
    type: SELECT_FILE,
    file,
  };
}

export function deselectFile(file) {
  return {
    type: DESELECT_FILE,
    file,
  };
}

export function setMediaViewerData(mediaViewerData) {
  return {
    type: SET_MEDIA_VIEWER_VISIBLE,
    mediaViewerData,
  };
}

export function setPrimaryProgressBarData(primaryProgressData) {
  return {
    type: SET_PRIMARY_PROGRESS_BAR_DATA,
    primaryProgressData,
  };
}

export function setSecondaryProgressBarData(secondaryProgressData) {
  return {
    type: SET_SECONDARY_PROGRESS_BAR_DATA,
    secondaryProgressData,
  };
}

export function setConvertDialogVisible(convertDialogVisible) {
  return {
    type: SET_CONVERT_DIALOG_VISIBLE,
    convertDialogVisible,
  };
}

export function setSharingPanelVisible(sharingPanelVisible) {
  return {
    type: SET_SHARING_PANEL_VISIBLE,
    sharingPanelVisible,
  };
}

export function setUploadPanelVisible(uploadPanelVisible) {
  return {
    type: SET_UPLOAD_PANEL_VISIBLE,
    uploadPanelVisible,
  };
}

export function setUpdateTree(updateTree) {
  return {
    type: SET_UPDATE_TREE,
    updateTree,
  };
}

export function setNewRowItems(newRowItems) {
  return {
    type: SET_NEW_ROW_ITEMS,
    newRowItems,
  };
}

export function setSelectedNode(node) {
  return {
    type: SET_SELECTED_NODE,
    node,
  };
}

export function setExpandSettingsTree(setting) {
  return {
    type: SET_EXPAND_SETTINGS_TREE,
    setting,
  };
}

export function setIsLoading(isLoading) {
  return {
    type: SET_IS_LOADING,
    isLoading,
  };
}

export function setFilesSettings(settings) {
  return {
    type: SET_FILES_SETTINGS,
    settings,
  };
}

export function setFilesSetting(setting, val) {
  return {
    type: SET_FILES_SETTING,
    setting,
    val,
  };
}

export function setIsErrorSettings(isError) {
  return {
    type: SET_IS_ERROR_SETTINGS,
    isError,
  };
}

export function setFirstLoad(firstLoad) {
  return {
    type: SET_FIRST_LOAD,
    firstLoad,
  };
}

export function setUploadData(uploadData) {
  return {
    type: SET_UPLOAD_DATA,
    uploadData,
  };
}

export function setThirdPartyCapabilities(capabilities) {
  return {
    type: SET_THIRDPARTY_CAPABILITIES,
    capabilities,
  };
}

export function setThirdPartyProviders(providers) {
  return {
    type: SET_THIRDPARTY_PROVIDERS,
    providers,
  };
}

export function setConnectItem(connectItem) {
  return {
    type: SET_CONNECT_ITEM,
    connectItem,
  };
}

export function setShowThirdPartyPanel(showThirdPartyPanel) {
  return {
    type: SET_SHOW_THIRDPARTY_PANEL,
    showThirdPartyPanel,
  };
}

export function setIsVerHistoryPanel(isVisible) {
  return {
    type: SET_IS_VER_HISTORY_PANEL,
    isVisible,
  };
}

export function setVerHistoryFileId(fileId) {
  return {
    type: SET_VER_HISTORY_FILE_ID,
    fileId,
  };
}

export function setFileVersions(versions) {
  return {
    type: SET_FILE_VERSIONS,
    versions,
  };
}

export function setChangeOwnerPanelVisible(ownerPanelVisible) {
  return {
    type: SET_CHANGE_OWNER_VISIBLE,
    ownerPanelVisible,
  };
}

export function selectUploadedFile(file) {
  return {
    type: SELECT_UPLOADED_FILE,
    file,
  };
}
export function updateUploadedFile(id, info) {
  return {
    type: UPDATE_UPLOADED_FILE,
    id,
    info,
  };
}

export function setFilterUrl(filter) {
  const defaultFilter = FilesFilter.getDefault();
  const params = [];
  const URLParams = queryString.parse(window.location.href);

  if (filter.filterType) {
    params.push(`${FILTER_TYPE}=${filter.filterType}`);
  }

  if (filter.withSubfolders === "false") {
    params.push(`${SEARCH_TYPE}=${filter.withSubfolders}`);
  }

  if (filter.search) {
    params.push(`${SEARCH}=${filter.search.trim()}`);
  }
  if (filter.authorType) {
    params.push(`${AUTHOR_TYPE}=${filter.authorType}`);
  }
  if (filter.folder) {
    params.push(`${FOLDER}=${filter.folder}`);
  }

  if (filter.pageCount !== defaultFilter.pageCount) {
    params.push(`${PAGE_COUNT}=${filter.pageCount}`);
  }

  if (URLParams.preview) {
    params.push(`${PREVIEW}=${URLParams.preview}`);
  }

  params.push(`${PAGE}=${filter.page + 1}`);
  params.push(`${SORT_BY}=${filter.sortBy}`);
  params.push(`${SORT_ORDER}=${filter.sortOrder}`);

  history.push(`${config.homepage}/filter?${params.join("&")}`);
}

// TODO: similar to fetchFolder, remove one
export function fetchFiles(folderId, filter, clearFilter = true) {
  return (dispatch, getState) => {
    const filterData = filter ? filter.clone() : FilesFilter.getDefault();
    filterData.folder = folderId;

    const state = getState();
    const privacyFolder = getPrivacyFolder(state);

    if (privacyFolder && privacyFolder.id === +folderId) {
      const isEncryptionSupported = isEncryptionSupport(state);

      if (!isEncryptionSupported) {
        filterData.treeFolders = createTreeFolders(
          privacyFolder.pathParts,
          filterData
        );
        filterData.total = 0;
        dispatch(setFilesFilter(filterData));
        if (clearFilter) {
          dispatch(setFolders([]));
          dispatch(setFiles([]));
          dispatch(setAction({ type: null }));
          dispatch(setSelected("close"));
          dispatch(
            setSelectedFolder({
              folders: [],
              ...privacyFolder,
              pathParts: privacyFolder.pathParts,
              ...{ new: 0 },
            })
          );
        }
        return Promise.resolve();
      }
    }

    return files.getFolder(folderId, filter).then((data) => {
      const isPrivacyFolder =
        data.current.rootFolderType === FolderType.Privacy;
      filterData.treeFolders = createTreeFolders(data.pathParts, filterData);
      filterData.total = data.total;
      dispatch(setFilesFilter(filterData));
      dispatch(
        setFolders(isPrivacyFolder && !isEncryptionSupport ? [] : data.folders)
      );
      dispatch(
        setFiles(isPrivacyFolder && !isEncryptionSupport ? [] : data.files)
      );
      if (clearFilter) {
        dispatch(setSelected("close"));
      }
      return dispatch(
        setSelectedFolder({
          folders: data.folders,
          ...data.current,
          pathParts: data.pathParts,
          ...{ new: data.new },
        })
      );
    });
  };
}

export function fetchFolders() {
  return Promise.resolve([]);
}

export function selectFolder() {
  return Promise.resolve([]);
}

export function fetchFolder(folderId, dispatch) {
  return files.getFolder(folderId).then((data) => {
    dispatch(setFolders(data.folders));
    dispatch(setFiles(data.files));
    return dispatch(
      setSelectedFolder({
        folders: data.folders,
        ...data.current,
        pathParts: data.pathParts,
      })
    );
  });
}

export function fetchMyFolder(dispatch) {
  return files.getMyFolderList().then((data) => {
    dispatch(setFolders(data.folders));
    dispatch(setFiles(data.files));
    return dispatch(setSelectedFolder(data.current));
  });
}

export function fetchTrashFolder(dispatch) {
  return files.getTrashFolderList().then((data) => {
    dispatch(setFiles(data.files));
    return dispatch(setSelectedFolder(data.current));
  });
}

export function fetchCommonFolder(dispatch) {
  return files.getCommonFolderList().then((data) => {
    dispatch(setFolders(data.folders));
    dispatch(setFiles(data.files));
    return dispatch(setSelectedFolder(data.current));
  });
}

export function fetchFavoritesFolder(folderId) {
  return (dispatch) => {
    return files.getFolder(folderId).then((data) => {
      dispatch(setFolders(data.folders));
      dispatch(setFiles(data.files));
      return dispatch(
        setSelectedFolder({
          folders: data.folders,
          ...data.current,
          pathParts: data.pathParts,
        })
      );
    });
  };
}

export function markItemAsFavorite(id) {
  return (dispatch) => {
    return files.markAsFavorite(id);
  };
}

export function removeItemFromFavorite(id) {
  return (dispatch) => {
    return files.removeFromFavorite(id);
  };
}

export function getFileInfo(id) {
  return (dispatch) => {
    return files.getFileInfo(id).then((data) => {
      dispatch(setFile(data));
    });
  };
}

export function fetchProjectsFolder(dispatch) {
  return files.getProjectsFolderList().then((data) => {
    dispatch(setFolders(data.folders));
    dispatch(setFiles(data.files));
    return dispatch(setSelectedFolder(data.current));
  });
}

export function fetchSharedFolder(dispatch) {
  return files.getSharedFolderList().then((data) => {
    dispatch(setFolders(data.folders));
    dispatch(setFiles(data.files));
    return dispatch(setSelectedFolder(data.current));
  });
}

export function fetchTreeFolders() {
  return (dispatch) =>
    files.getFoldersTree().then((data) => dispatch(setTreeFolders(data)));
}

/*export function testUpdateMyFolder(folders) {
  return (dispatch, getState) => {
    const { files } = getState();

    console.log("folders", folders);

    const newRoot = rootFolders;
    newRoot.my.folders = folders;
    console.log("newRoot.my.folders", newRoot.my.folders);
    console.log("folders", folders);
    console.log("newRoot", newRoot);
    //dispatch(setRootFolders(null));
    dispatch(setRootFolders(newRoot));

  }
  //setRootFolders
}*/

export function createFile(folderId, title) {
  return (dispatch) => {
    return files.createFile(folderId, title).then((file) => {
      return Promise.resolve(file);
    });
  };
}

export function createFolder(parentFolderId, title) {
  return files.createFolder(parentFolderId, title);
}

export function updateFile(fileId, title) {
  return (dispatch) => {
    return files.updateFile(fileId, title).then((file) => {
      dispatch(setFile(file));
    });
  };
}

export function addFileToRecentlyViewed(fileId, isPrivacy) {
  return (dispatch) => {
    if (isPrivacy) return Promise.resolve();
    return files.addFileToRecentlyViewed(fileId);
  };
}

export function renameFolder(folderId, title) {
  return (dispatch) => {
    return files.renameFolder(folderId, title).then((folder) => {
      dispatch(setFolder(folder));
    });
  };
}

export function setFilesOwner(folderIds, fileIds, ownerId) {
  return files.setFileOwner(folderIds, fileIds, ownerId);
}

export function setShareFiles(
  folderIds,
  fileIds,
  share,
  notify,
  sharingMessage,
  externalAccess,
  ownerId
) {
  let externalAccessRequest = [];
  if (fileIds.length === 1 && externalAccess !== null) {
    externalAccessRequest = fileIds.map((id) =>
      files.setExternalAccess(id, externalAccess)
    );
  }

  const ownerChangeRequest = ownerId
    ? [setFilesOwner(folderIds, fileIds, ownerId)]
    : [];

  const shareRequest = !!share.length
    ? [files.setShareFiles(fileIds, folderIds, share, notify, sharingMessage)]
    : [];

  const requests = [
    ...ownerChangeRequest,
    ...shareRequest,
    ...externalAccessRequest,
  ];

  return axios.all(requests);
}

export function getShareUsers(folderIds, fileIds) {
  return files.getShareFiles(fileIds, folderIds);
}

export function clearPrimaryProgressData() {
  return (dispatch) => {
    dispatch(
      setPrimaryProgressBarData({
        visible: false,
        percent: 0,
        label: "",
        icon: "",
        alert: false,
      })
    );
  };
}

export function clearSecondaryProgressData() {
  return (dispatch) => {
    dispatch(
      setSecondaryProgressBarData({
        visible: false,
        percent: 0,
        label: "",
        icon: "",
        alert: false,
      })
    );
  };
}

/*export function deleteGroup(id) {
  return (dispatch, getState) => {
    const { people } = getState();
    const { groups, filter } = people;

    return api.groups
      .deleteGroup(id)
      .then(res => {
        return dispatch(setGroups(groups.filter(g => g.id !== id)));
      })
      .then(() => {
        const newFilter = filter.clone(true);
        return fetchPeople(newFilter, dispatch);
      });
  };
}*/

export function setUpdateIfExist(data, setting) {
  return (dispatch) => {
    return files
      .updateIfExist(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function setStoreOriginal(data, setting) {
  return (dispatch) => {
    return files
      .storeOriginal(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function setConfirmDelete(data, setting) {
  return (dispatch) => {
    return files
      .changeDeleteConfirm(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function setStoreForceSave(data, setting) {
  return (dispatch) => {
    return files
      .storeForceSave(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function setEnableThirdParty(data, setting) {
  return (dispatch) => {
    return files
      .thirdParty(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function deleteThirdParty(id) {
  return files.deleteThirdParty(id);
}

export function saveThirdParty(
  url,
  login,
  password,
  token,
  isCorporate,
  customerTitle,
  providerKey,
  providerId
) {
  return files.saveThirdParty(
    url,
    login,
    password,
    token,
    isCorporate,
    customerTitle,
    providerKey,
    providerId
  );
}

export function setForceSave(data, setting) {
  return (dispatch) => {
    return files
      .forceSave(data)
      .then((res) => dispatch(setFilesSetting(setting, res)));
  };
}

export function getFilesSettings() {
  return (dispatch, getState) => {
    const state = getState();
    const settingsTree = getSettingsTree(state);

    if (Object.keys(settingsTree).length === 0) {
      return api.files
        .getSettingsFiles()
        .then((settings) => {
          dispatch(setFilesSettings(settings));
          if (settings.enableThirdParty) {
            return axios
              .all([
                api.files.getThirdPartyCapabilities(),
                api.files.getThirdPartyList(),
              ])
              .then(([capabilities, providers]) => {
                for (let item of capabilities) {
                  item.splice(1, 1);
                }

                dispatch(setThirdPartyCapabilities(capabilities));
                dispatch(setThirdPartyProviders(providers));
              });
          }
        })
        .catch(() => setIsErrorSettings(true));
    } else {
      return Promise.resolve(settingsTree);
    }
  };
}

export const startUpload = (uploadFiles, folderId, t) => {
  return (dispatch, getState) => {
    const state = getState();

    const { uploadData } = state.files;

    //console.log("start upload", uploadData);

    let newFiles = state.files.uploadData.files;
    let filesSize = 0;

    for (let index of Object.keys(uploadFiles)) {
      const file = uploadFiles[index];

      const parts = file.name.split(".");
      const ext = parts.length > 1 ? "." + parts.pop() : "";
      const needConvert = canConvert(ext)(state);

      newFiles.push({
        file: file,
        uniqueId: uniqueid("download_row-key_"),
        fileId: null,
        toFolderId: folderId,
        action: needConvert ? "convert" : "upload",
        error: file.size ? null : t("EmptyFile"),
        fileInfo: null,
        cancel: false,
      });

      filesSize += file.size;
    }

    //const showConvertDialog = uploadStatus === "pending";

    const { percent, uploadedFiles, uploaded } = uploadData;

    //console.log("newFiles: ", newFiles);

    const newUploadData = {
      files: newFiles,
      filesSize,
      uploadedFiles,
      percent,
      uploaded: false,
    };

    dispatch(setUploadData(newUploadData));

    if (uploaded) {
      startUploadFiles(t, dispatch, getState);
    }
  };
};

export const cancelUpload = () => {
  return (dispatch, getState) => {
    const state = getState();

    const { uploadData } = state.files;
    const files = uploadData.files;
    let newFiles = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].fileId) {
        newFiles.push(files[i]);
      }
    }
    const { filesSize, uploadedFiles } = uploadData;

    const newUploadData = {
      files: newFiles,
      filesSize,
      uploadedFiles,
      percent: 100,
      uploaded: true,
    };

    if (newUploadData.files.length === 0)
      dispatch(setUploadPanelVisible(false));

    dispatch(setUploadData(newUploadData));
  };
};

export const cancelCurrentUpload = (id) => {
  return (dispatch, getState) => {
    const state = getState();

    const { uploadData } = state.files;
    const files = uploadData.files;
    const newFiles = files.filter((el) => el.uniqueId !== id);

    console.log("newFiles", files);

    const { filesSize, percent, uploadedFiles } = uploadData;

    const newUploadData = {
      files: newFiles,
      filesSize,
      uploadedFiles,
      percent: percent,
      uploaded: false,
    };

    dispatch(setUploadData(newUploadData));
  };
};

const startUploadFiles = async (t, dispatch, getState) => {
  let state = getState();

  let { files, percent, filesSize } = state.files.uploadData;

  if (files.length === 0 || filesSize === 0)
    return finishUploadFiles(getState, dispatch);

  const progressData = {
    visible: true,
    percent,
    icon: "upload",
    alert: false,
  };

  dispatch(setPrimaryProgressBarData(progressData));

  let index = 0;
  let len = files.length;

  while (index < len) {
    await startSessionFunc(index, t, dispatch, getState);
    index++;

    state = getState();
    files = state.files.uploadData.files;
    len = files.length;
  }

  //TODO: Uncomment after fix conversation
  /*const filesToConvert = getFilesToConvert(files);
  if (filesToConvert.length > 0) {
    // Ask to convert options
    return dispatch(setConvertDialogVisible(true));
  }*/

  // All files has been uploaded and nothing to convert
  finishUploadFiles(getState, dispatch);
};

const getFilesToConvert = (files) => {
  const filesToConvert = files.filter((f) => f.action === "convert");
  return filesToConvert;
};

export const clearUploadData = () => {
  return (dispatch) => {
    const uploadData = {
      files: [],
      filesSize: 0,
      uploadStatus: null,
      uploadedFiles: 0,
      percent: 0,
      uploaded: true,
    };
    dispatch(setUploadData(uploadData));
  };
};

const finishUploadFiles = (getState, dispatch) => {
  const state = getState();
  const { files } = state.files.uploadData;
  const { uploadPanelVisible } = state.files;
  const totalErrorsCount = sumBy(files, (f) => (f.error ? 1 : 0));

  if (totalErrorsCount > 0) console.log("Errors: ", totalErrorsCount);

  const uploadData = {
    files: uploadPanelVisible ? files : [],
    filesSize: 0,
    uploadStatus: null,
    uploadedFiles: 0,
    percent: 0,
    uploaded: true,
  };

  setTimeout(() => {
    dispatch(clearPrimaryProgressData());
    dispatch(setUploadData(uploadData));
  }, TIMEOUT);
};

const chunkSize = 1024 * 1023; //~0.999mb

const throttleRefreshFiles = throttle((toFolderId, dispatch, getState) => {
  return refreshFiles(toFolderId, dispatch, getState).catch((err) => {
    console.log("RefreshFiles failed", err);
    return Promise.resolve();
  });
}, 1000);

const startSessionFunc = (indexOfFile, t, dispatch, getState) => {
  const state = getState();
  const { uploadData } = state.files;
  const { uploaded, files } = uploadData;

  //console.log("START UPLOAD SESSION FUNC", uploadData);

  if (!uploaded && files.length === 0) {
    uploadData.uploaded = true;
    dispatch(setUploadData(uploadData));
    return;
  }

  const item = files[indexOfFile];

  if (!item) {
    console.error("Empty files");
    return Promise.resolve();
  }

  const { file, toFolderId /*, action*/ } = item;
  const chunks = Math.ceil(file.size / chunkSize, chunkSize);
  const fileName = file.name;
  const fileSize = file.size;
  const relativePath = file.path
    ? file.path.slice(1, -file.name.length)
    : file.webkitRelativePath
    ? file.webkitRelativePath.slice(0, -file.name.length)
    : "";

  return api.files
    .startUploadSession(toFolderId, fileName, fileSize, relativePath)
    .then((res) => {
      const location = res.data.location;

      const requestsDataArray = [];

      let chunk = 0;

      while (chunk < chunks) {
        const offset = chunk * chunkSize;
        const formData = new FormData();
        formData.append("file", file.slice(offset, offset + chunkSize));
        requestsDataArray.push(formData);
        chunk++;
      }

      return { location, requestsDataArray, fileSize };
    })
    .then(({ location, requestsDataArray, fileSize }) => {
      const state = getState();
      const { percent } = state.files.uploadData;
      dispatch(
        setPrimaryProgressBarData({
          icon: "upload",
          visible: true,
          percent: percent,
          loadingFile: {
            uniqueId: files[indexOfFile].uniqueId,
            percent: chunks < 2 ? 50 : 0,
          },
        })
      );

      return uploadFileChunks(
        location,
        requestsDataArray,
        fileSize,
        indexOfFile,
        file,
        dispatch,
        t,
        getState
      );
    })
    .catch((err) => {
      const state = getState();
      const { uploadData } = state.files;

      if (uploadData.files[indexOfFile] === undefined) {
        dispatch(
          setPrimaryProgressBarData({
            icon: "upload",
            percent: 100,
            visible: true,
            alert: true,
          })
        );
        return Promise.resolve();
      }

      uploadData.files[indexOfFile].error = err;

      dispatch(setUploadData(uploadData));

      const newPercent = getNewPercent(fileSize, indexOfFile, getState);

      dispatch(
        setPrimaryProgressBarData({
          icon: "upload",
          percent: newPercent,
          visible: true,
          alert: true,
        })
      );

      return Promise.resolve();
    });
};

const uploadFileChunks = async (
  location,
  requestsDataArray,
  fileSize,
  indexOfFile,
  file,
  dispatch,
  t,
  getState
) => {
  const length = requestsDataArray.length;
  for (let index = 0; index < length; index++) {
    const state = getState();
    if (
      state.files.uploadData.uploaded ||
      !state.files.uploadData.files.some((f) => f.file === file) ||
      state.files.uploadData.files[indexOfFile].cancel
    ) {
      return Promise.resolve();
    }

    const res = await api.files.uploadFile(location, requestsDataArray[index]);

    //console.log(`Uploaded chunk ${index}/${length}`, res);

    //let isLatestFile = indexOfFile === newFilesLength - 1;
    const fileId = res.data.data.id;

    const { uploaded } = res.data.data;

    const uploadedSize = uploaded ? fileSize : index * chunkSize;

    const newPercent = getNewPercent(uploadedSize, indexOfFile, getState);

    const newState = getState();
    const { uploadData } = newState.files;
    const { uploadedFiles, files } = uploadData;

    const percentCurrentFile = (index / length) * 100;
    dispatch(
      setPrimaryProgressBarData({
        icon: "upload",
        percent: newPercent,
        visible: true,
        loadingFile: {
          uniqueId: files[indexOfFile].uniqueId,
          percent: percentCurrentFile,
        },
      })
    );

    if (uploaded) {
      uploadData.files[indexOfFile].fileId = fileId;
      uploadData.files[indexOfFile].fileInfo = await api.files.getFileInfo(
        fileId
      );
      uploadData.percent = newPercent;
      dispatch(setUploadData(uploadData));
    }
  }

  // All chuncks are uploaded

  const newState = getState();

  const { files } = newState.files.uploadData;
  const currentFile = files[indexOfFile];

  if (!currentFile) return Promise.resolve();

  const { toFolderId } = currentFile;

  return throttleRefreshFiles(toFolderId, dispatch, getState);
};
const getNewPercent = (uploadedSize, indexOfFile, getState) => {
  const newState = getState();
  const { files } = newState.files.uploadData;

  const newTotalSize = sumBy(files, (f) => f.file.size);
  const totalUploadedFiles = files.filter((_, i) => i < indexOfFile);
  const totalUploadedSize = sumBy(totalUploadedFiles, (f) => f.file.size);
  const newPercent = ((uploadedSize + totalUploadedSize) / newTotalSize) * 100;

  /*console.log(
    `newPercent=${newPercent} (newTotalSize=${newTotalSize} totalUploadedSize=${totalUploadedSize} indexOfFile=${indexOfFile})`
  );*/

  return newPercent;
};

// const updateFiles = (folderId, dispatch, getState) => {
//   //console.log("folderId ", folderId);
//   const uploadData = {
//     files: [],
//     filesSize: 0,
//     convertFiles: [],
//     convertFilesSize: 0,
//     uploadedFiles: 0,
//     percent: 0,
//     uploaded: true,
//   };
//   return refreshFiles(folderId, dispatch, getState)
//     .catch((err) => {
//       dispatch(
//         setPrimaryProgressBarData({
//           alert: true,
//           visible: true,
//         })
//       );
//       setTimeout(() => dispatch(clearPrimaryProgressData()), TIMEOUT);
//       //toastr.error(err);
//     })
//     .finally(() =>
//       setTimeout(() => {
//         dispatch(clearPrimaryProgressData());
//         dispatch(setUploadData(uploadData));
//       }, TIMEOUT)
//     );
// };

const refreshFiles = (folderId, dispatch, getState) => {
  const { files } = getState();
  const { filter, treeFolders, selectedFolder } = files;
  if (
    selectedFolder.id === folderId &&
    window.location.pathname.indexOf("/history") === -1
  ) {
    return dispatch(fetchFiles(selectedFolder.id, filter.clone(), false)).then(
      (data) => {
        const path = data.selectedFolder.pathParts;
        const newTreeFolders = treeFolders;
        const folders = data.selectedFolder.folders;
        const foldersCount = data.selectedFolder.foldersCount;
        loopTreeFolders(path, newTreeFolders, folders, foldersCount);
        dispatch(setTreeFolders(newTreeFolders));
        dispatch(setUpdateTree(true));
      }
    );
  } else {
    return api.files.getFolder(folderId, filter.clone()).then((data) => {
      const path = data.pathParts;
      const newTreeFolders = treeFolders;
      const folders = data.folders;
      const foldersCount = data.count;
      loopTreeFolders(path, newTreeFolders, folders, foldersCount);
      dispatch(setTreeFolders(newTreeFolders));
      dispatch(setUpdateTree(true));
    });
  }
};

/*const getConvertProgress = (
  fileId,
  t,
  uploadData,
  isLatestFile,
  indexOfFile,
  dispatch,
  getState
) => {
  const { uploadedFiles } = uploadData;
  api.files.getFileConversationProgress(fileId).then((res) => {
    if (res && res[0] && res[0].progress !== 100) {
      setTimeout(
        () =>
          getConvertProgress(
            fileId,
            t,
            uploadData,
            isLatestFile,
            indexOfFile,
            dispatch,
            getState
          ),
        1000
      );
    } else {
      uploadData.uploadedFiles = uploadedFiles + 1;
      updateConvertProgress(uploadData, t, dispatch);
      !isLatestFile && startSessionFunc(indexOfFile + 1, t, dispatch, getState);

      if (res[0].error) {
        dispatch(
          setPrimaryProgressBarData({
            visible: true,
            alert: true,
          })
        );
        setTimeout(() => dispatch(clearPrimaryProgressData()), TIMEOUT);
        //toastr.error(res[0].error);
      }
      if (isLatestFile) {
        const toFolderId = uploadData.files[indexOfFile].toFolderId;
        updateFiles(toFolderId, dispatch, getState);
        return;
      }
    }
  });
};

const updateConvertProgress = (uploadData, t, dispatch) => {
  const { uploadedFiles, uploadStatus, files, convertFiles } = uploadData;
  let progressVisible = true;
  const file = uploadedFiles;
  let percent = uploadData.percent;

  const totalFiles =
    uploadStatus === "cancel"
      ? files.length
      : files.length + convertFiles.length;

  if (uploadedFiles === totalFiles) {
    percent = 100;
    uploadData.percent = 0;
    uploadData.uploadedFiles = 0;
    uploadData.uploadStatus = null;
    progressVisible = false;
  }

  dispatch(setUploadData(uploadData));

  dispatch(
    setPrimaryProgressBarData({
      icon: "upload",
      label: t("UploadingLabel", { file, totalFiles }),
      percent,
      visible: true,
      alert: false,
    })
  );
  if (!progressVisible) {
    setTimeout(() => dispatch(clearPrimaryProgressData()), TIMEOUT);
  }
};*/

export const setDialogVisible = (t) => {
  return (dispatch, getState) => {
    const { uploadData } = getState().files;
    const { files, uploadStatus, uploadedFiles, percent } = uploadData;

    dispatch(setConvertDialogVisible(false));
    const label = t("UploadingLabel", {
      file: uploadedFiles,
      totalFiles: files.length,
    });

    if (uploadStatus === null) {
      dispatch(
        setPrimaryProgressBarData({
          icon: "upload",
          label,
          percent: 100,
          visible: true,
          alert: false,
        })
      );
      uploadData.uploadedFiles = 0;
      uploadData.percent = 0;
      dispatch(setUploadData(uploadData));
    } else if (!files.length) {
      dispatch(clearPrimaryProgressData());
    } else {
      dispatch(
        setPrimaryProgressBarData({
          icon: "upload",
          label,
          percent,
          visible: true,
          alert: false,
        })
      );
      uploadData.uploadStatus = "cancel";
      dispatch(setUploadData(uploadData));
    }
  };
};
export const convertUploadedFiles = (t) => {
  return (dispatch, getState) => {
    const state = getState();

    const { uploadData } = state.files;
    const filesToConvert = getFilesToConvert(uploadData.files);

    if (filesToConvert.length > 0) {
      startConvertFiles(filesToConvert, t, dispatch, getState).then(() =>
        finishUploadFiles(getState, dispatch)
      );
    } else {
      finishUploadFiles(getState, dispatch);
    }
  };
};

const getConversationProgress = async (fileId) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        api.files.getFileConversationProgress(fileId).then((res) => {
          console.log(res);
          resolve(res);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    }, 1000);
  });

  return promise;
};

const startConvertFiles = async (files, t, dispatch, getState) => {
  const state = getState();
  const { uploadData } = state.files;

  const total = files.length;
  dispatch(setConvertDialogVisible(false));
  dispatch(
    setPrimaryProgressBarData({
      icon: "file",
      label: t("ConvertingLabel", {
        file: 0,
        totalFiles: total,
      }),
      percent: 0,
      visible: true,
    })
  );
  for (let index = 0; index < total; index++) {
    const fileId = uploadData.files[index].fileId;

    const data = await api.files.convertFile(fileId);

    if (data && data[0] && data[0].progress !== 100) {
      let progress = data[0].progress;
      let error = null;
      while (progress < 100) {
        const res = await getConversationProgress(fileId);

        progress = res && res[0] && res[0].progress;
        error = res && res[0] && res[0].error;
        if (error.length) {
          dispatch(
            setPrimaryProgressBarData({
              icon: "file",
              visible: true,
              alert: true,
            })
          );
          return;
        }
        if (progress === 100) {
          break;
        } else {
          //TODO: calculate local progress
          // const percent = (progress) + (index / total) * 100;
          // dispatch(
          //   setPrimaryProgressBarData({
          //     icon: "file",
          //     label: t("ConvertingLabel", {
          //       file: index + 1,
          //       totalFiles: total,
          //     }),
          //     percent: newPercent,
          //     visible: true,
          //   })
          // );
        }

        //setTimeout(() => { console.log("Wait for a second...") }, 1000);
      }
    }

    const newPercent = (index + 1 / total) * 100;

    dispatch(
      setPrimaryProgressBarData({
        icon: "file",
        label: t("ConvertingLabel", {
          file: index + 1,
          totalFiles: total,
        }),
        percent: newPercent,
        visible: true,
      })
    );
  }
};

const convertSplitItem = (item) => {
  let splitItem = item.split("_");
  const fileExst = splitItem[0];
  splitItem.splice(0, 1);
  if (splitItem[splitItem.length - 1] === "draggable") {
    splitItem.splice(-1, 1);
  }
  splitItem = splitItem.join("_");
  return [fileExst, splitItem];
};

export const setSelections = (items) => {
  return (dispatch, getState) => {
    const {
      selection,
      folders,
      files,
      fileActionId,
      selected,
    } = getState().files;

    if (selection.length > items.length) {
      //Delete selection
      const newSelection = [];
      let newFile = null;
      for (let item of items) {
        if (!item) break; // temporary fall protection selection tile

        item = convertSplitItem(item);
        if (item[0] === "folder") {
          newFile = selection.find((x) => x.id + "" === item[1] && !x.fileExst);
        } else if (item[0] === "file") {
          newFile = selection.find((x) => x.id + "" === item[1] && x.fileExst);
        }
        if (newFile) {
          newSelection.push(newFile);
        }
      }

      for (let item of selection) {
        const element = newSelection.find(
          (x) => x.id === item.id && x.fileExst === item.fileExst
        );
        if (!element) {
          dispatch(deselectFile(item));
        }
      }
    } else if (selection.length < items.length) {
      //Add selection
      for (let item of items) {
        if (!item) break; // temporary fall protection selection tile

        let newFile = null;
        item = convertSplitItem(item);
        if (item[0] === "folder") {
          newFile = folders.find((x) => x.id + "" === item[1] && !x.fileExst);
        } else if (item[0] === "file") {
          newFile = files.find((x) => x.id + "" === item[1] && x.fileExst);
        }
        if (newFile && fileActionId !== newFile.id) {
          const existItem = selection.find(
            (x) => x.id === newFile.id && x.fileExst === newFile.fileExst
          );
          if (!existItem) {
            dispatch(selectFile(newFile));
            selected !== "none" && dispatch(setSelected("none"));
          }
        }
      }
    } else if (selection.length === items.length && items.length === 1) {
      const item = convertSplitItem(items[0]);

      if (item[1] !== selection[0].id) {
        let addFile = null;
        let delFile = null;
        const newSelection = [];
        if (item[0] === "folder") {
          delFile = selection.find((x) => x.id + "" === item[1] && !x.fileExst);
          addFile = folders.find((x) => x.id + "" === item[1] && !x.fileExst);
        } else if (item[0] === "file") {
          delFile = selection.find((x) => x.id + "" === item[1] && x.fileExst);
          addFile = files.find((x) => x.id + "" === item[1] && x.fileExst);
        }

        const existItem = selection.find(
          (x) => x.id === addFile.id && x.fileExst === addFile.fileExst
        );
        if (!existItem) {
          dispatch(selectFile(addFile));
          selected !== "none" && dispatch(setSelected("none"));
        }

        if (delFile) {
          newSelection.push(delFile);
        }

        for (let item of selection) {
          const element = newSelection.find(
            (x) => x.id === item.id && x.fileExst === item.fileExst
          );
          if (!element) {
            dispatch(deselectFile(item));
          }
        }
      } else {
        return;
      }
    } else {
      return;
    }
  };
};

export const loopFilesOperations = (id, destFolderId, isCopy) => {
  return (dispatch, getState) => {
    const state = getState();

    const currentFolderId = getSelectedFolderId(state);
    const filter = getFilter(state);
    const isRecycleBin = getIsRecycleBinFolder(state);
    const progressData = getSecondaryProgressData(state);
    const treeFolders = getTreeFolders(state);

    const loopOperation = () => {
      api.files
        .getProgress()
        .then((res) => {
          const currentItem = res.find((x) => x.id === id);
          if (currentItem && currentItem.progress !== 100) {
            dispatch(
              setSecondaryProgressBarData({
                icon: isCopy ? "duplicate" : "move",
                label: progressData.label,
                percent: currentItem.progress,
                visible: true,
                alert: false,
              })
            );
            setTimeout(() => loopOperation(), 1000);
          } else {
            dispatch(
              setSecondaryProgressBarData({
                icon: isCopy ? "duplicate" : "move",
                label: progressData.label,
                percent: 100,
                visible: true,
                alert: false,
              })
            );
            api.files
              .getFolder(destFolderId)
              .then((data) => {
                let newTreeFolders = treeFolders;
                let path = data.pathParts.slice(0);
                let folders = data.folders;
                let foldersCount = data.current.foldersCount;
                loopTreeFolders(path, newTreeFolders, folders, foldersCount);

                if (!isCopy || destFolderId === currentFolderId) {
                  dispatch(fetchFiles(currentFolderId, filter))
                    .then((data) => {
                      if (!isRecycleBin) {
                        newTreeFolders = treeFolders;
                        path = data.selectedFolder.pathParts.slice(0);
                        folders = data.selectedFolder.folders;
                        foldersCount = data.selectedFolder.foldersCount;
                        loopTreeFolders(
                          path,
                          newTreeFolders,
                          folders,
                          foldersCount
                        );
                        dispatch(setUpdateTree(true));
                        dispatch(setTreeFolders(newTreeFolders));
                      }
                    })
                    .catch((err) => {
                      dispatch(
                        setPrimaryProgressBarData({
                          visible: true,
                          alert: true,
                        })
                      );
                      //toastr.error(err);
                      setTimeout(
                        () => dispatch(clearSecondaryProgressData()),
                        TIMEOUT
                      );
                    })
                    .finally(() => {
                      setTimeout(
                        () => dispatch(clearSecondaryProgressData()),
                        TIMEOUT
                      );
                    });
                } else {
                  dispatch(
                    setSecondaryProgressBarData({
                      icon: "duplicate",
                      label: progressData.label,
                      percent: 100,
                      visible: true,
                      alert: false,
                    })
                  );
                  setTimeout(
                    () => dispatch(clearSecondaryProgressData()),
                    TIMEOUT
                  );
                  dispatch(setUpdateTree(true));
                  dispatch(setTreeFolders(newTreeFolders));
                }
              })
              .catch((err) => {
                dispatch(
                  setSecondaryProgressBarData({
                    visible: true,
                    alert: true,
                  })
                );
                //toastr.error(err);
                setTimeout(
                  () => dispatch(clearSecondaryProgressData()),
                  TIMEOUT
                );
              });
          }
        })
        .catch((err) => {
          dispatch(
            setSecondaryProgressBarData({
              visible: true,
              alert: true,
            })
          );
          //toastr.error(err);
          setTimeout(() => dispatch(clearSecondaryProgressData()), TIMEOUT);
        });
    };

    loopOperation();
  };
};

export function selectItemOperation(
  destFolderId,
  folderIds,
  fileIds,
  conflictResolveType,
  deleteAfter,
  isCopy
) {
  return (dispatch) => {
    return isCopy
      ? files.copyToFolder(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter
        )
      : files.moveToFolder(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter
        );
  };
}

export function itemOperationToFolder(
  destFolderId,
  folderIds,
  fileIds,
  conflictResolveType,
  deleteAfter,
  isCopy
) {
  return (dispatch) => {
    return dispatch(
      selectItemOperation(
        destFolderId,
        folderIds,
        fileIds,
        conflictResolveType,
        deleteAfter,
        isCopy
      )
    )
      .then((res) => {
        const id = res[0] && res[0].id ? res[0].id : null;
        dispatch(loopFilesOperations(id, destFolderId, isCopy));
      })
      .catch((err) => {
        dispatch(
          setPrimaryProgressBarData({
            visible: true,
            alert: true,
          })
        );
        //toastr.error(err);
        setTimeout(() => dispatch(clearPrimaryProgressData()), TIMEOUT);
        setTimeout(() => dispatch(clearSecondaryProgressData()), TIMEOUT);
      });
  };
}

export function fetchThirdPartyProviders() {
  return (dispatch) => {
    files.getThirdPartyList().then((data) => {
      dispatch(setThirdPartyProviders(data));
    });
  };
}

const convertServiceName = (serviceName) => {
  //Docusign, OneDrive, Wordpress
  switch (serviceName) {
    case "GoogleDrive":
      return "google";
    case "Box":
      return "box";
    case "DropboxV2":
      return "dropbox";
    case "OneDrive":
      return "onedrive";
    default:
      return "";
  }
};

export function getOAuthToken(modal) {
  return new Promise((resolve) => {
    localStorage.removeItem("code");
    const interval = setInterval(() => {
      try {
        const code = localStorage.getItem("code");

        if (code) {
          localStorage.removeItem("code");
          clearInterval(interval);
          resolve(code);
        }
      } catch {
        return;
      }
    }, 500);
  });
}

export function openConnectWindow(serviceName, modal) {
  const service = convertServiceName(serviceName);
  return api.files.openConnectWindow(service).then((link) => {
    return oAuthPopup(link, modal);
  });
}

export function oAuthPopup(url, modal) {
  let newWindow = modal;

  if (modal) {
    newWindow.location = url;
  }

  try {
    let params =
      "height=600,width=1020,resizable=0,status=0,toolbar=0,menubar=0,location=1";
    newWindow = modal ? newWindow : window.open(url, "Authorization", params);
  } catch (err) {
    newWindow = modal ? newWindow : window.open(url, "Authorization");
  }

  return newWindow;
}

export function fetchFileVersions(fileId) {
  return (dispatch, getState) => {
    const state = getState();
    const currentId = getVerHistoryFileId(state);
    if (currentId !== fileId) {
      dispatch(setVerHistoryFileId(fileId));
      return api.files
        .getFileVersionInfo(fileId)
        .then((versions) => dispatch(setFileVersions(versions)));
    } else {
      const currentVersions = getFileVersions(state);
      return Promise.resolve(currentVersions);
    }
  };
}

export function markAsVersion(id, isVersion, version) {
  return (dispatch) => {
    return api.files
      .markAsVersion(id, isVersion, version)
      .then((versions) => dispatch(setFileVersions(versions)));
  };
}

export function restoreVersion(id, version) {
  return (dispatch, getState) => {
    return api.files.versionRestore(id, version).then((newVersion) => {
      const state = getState();
      const versions = getFileVersions(state);
      const updatedVersions = versions.slice();
      updatedVersions.splice(1, 0, newVersion);
      dispatch(setFileVersions(updatedVersions));
    });
  };
}

export function updateCommentVersion(id, comment, version) {
  return (dispatch, getState) => {
    return api.files
      .versionEditComment(id, comment, version)
      .then((updatedComment) => {
        const state = getState();
        const versions = getFileVersions(state);
        const copyVersions = versions.slice();
        const updatedVersions = copyVersions.map((item) => {
          if (item.version === version) {
            item.comment = updatedComment;
          }
          return item;
        });
        dispatch(setFileVersions(updatedVersions));
      });
  };
}

export function updateUploadedItem(id) {
  return (dispatch) => {
    return api.files
      .getFileInfo(id)
      .then((data) => dispatch(updateUploadedFile(id, data)));
  };
}
