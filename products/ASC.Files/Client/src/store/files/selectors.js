import { find, filter } from "lodash";
import { constants, store } from "asc-web-common";
import { createSelector } from "reselect";

const { FileType, FilterType, FolderType } = constants;
const {
  isAdmin,
  isVisitor,
  getCurrentUserId,
  isEncryptionSupport,
  isDesktopClient,
} = store.auth.selectors;

const presentInArray = (array, search, caseInsensitive = false) => {
  let pattern = caseInsensitive ? search.toLowerCase() : search;
  const result = array.findIndex((item) => item === pattern);
  return result === -1 ? false : true;
};

export const getAccessIcon = (access) => {
  switch (access) {
    case 1:
      return "AccessEditIcon";
    case 2:
      return "EyeIcon";
    case 3:
      return "AccessNoneIcon";
    case 4:
      return "CatalogQuestionIcon";
    case 5:
      return "AccessReviewIcon";
    case 6:
      return "AccessCommentIcon";
    case 7:
      return "AccessFormIcon";
    case 8:
      return "CustomFilterIcon";
    default:
      return;
  }
};

export const getMediaViewerImageFormats = (state) => {
  return state.files.mediaViewerFormats.images;
};

export const getMediaViewerMediaFormats = (state) => {
  return state.files.mediaViewerFormats.media;
};

export const getEditedFormats = (state) => {
  return state.files.docservice.editedDocs;
};

export const getCommentedFormats = (state) => {
  return state.files.docservice.commentedDocs;
};

export const getReviewedFormats = (state) => {
  return state.files.docservice.reviewedDocs;
};

export const getWebFilterFormats = (state) => {
  return state.files.docservice.customfilterDocs;
};

export const getFormFillingFormats = (state) => {
  return state.files.docservice.formfillingDocs;
};

export const getConvertedFormats = (state) => {
  return state.files.docservice.convertDocs;
};

export const getEncryptedFormats = (state) => {
  return state.files.docservice.encryptedDocs;
};

export const getArchiveFormats = (state) => {
  return state.files.formats.archive;
};

export const getImageFormats = (state) => {
  return state.files.formats.image;
};

export const getSoundFormats = (state) => {
  return state.files.formats.sound;
};

export const getVideoFormats = (state) => {
  return state.files.formats.video;
};

export const getHtmlFormats = (state) => {
  return state.files.formats.html;
};

export const getEbookFormats = (state) => {
  return state.files.formats.ebook;
};

export const getDocumentFormats = (state) => {
  return state.files.formats.document;
};

export const getPresentationFormats = (state) => {
  return state.files.formats.presentation;
};

export const getSpreadsheetFormats = (state) => {
  return state.files.formats.spreadsheet;
};

export const canWebEdit = (extension) => {
  return createSelector(getEditedFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const canWebComment = (extension) => {
  return createSelector(getCommentedFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const canWebReview = (extension) => {
  return createSelector(getReviewedFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const canWebFilterEditing = (extension) => {
  return createSelector(getWebFilterFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};
export const canFormFillingDocs = (extension) => {
  return createSelector(getFormFillingFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const canConvert = (extension) => {
  return createSelector(getConvertedFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isArchive = (extension) => {
  return createSelector(getArchiveFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isImage = (extension) => {
  return createSelector(getImageFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isSound = (extension) => {
  return createSelector(getSoundFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isVideo = (extension) => {
  return createSelector(getMediaViewerMediaFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isHtml = (extension) => {
  return createSelector(getHtmlFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isEbook = (extension) => {
  return createSelector(getEbookFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isDocument = (extension) => {
  return createSelector(getDocumentFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isPresentation = (extension) => {
  return createSelector(getPresentationFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export const isSpreadsheet = (extension) => {
  return createSelector(getSpreadsheetFormats, (formats) => {
    return presentInArray(formats, extension);
  });
};

export function getSelectedFile(selection, fileId, parentId) {
  return find(selection, function (obj) {
    return obj.id === fileId && obj.parentId === parentId;
  });
}

export function isFileSelected(selection, fileId, parentId) {
  return getSelectedFile(selection, fileId, parentId) !== undefined;
}

export function skipFile(selection, fileId) {
  return filter(selection, function (obj) {
    return obj.id !== fileId;
  });
}

export function getFilesBySelected(files, selected) {
  let newSelection = [];
  files.forEach((file) => {
    const checked = getFilesChecked(file, selected);

    if (checked) newSelection.push(file);
  });

  return newSelection;
}

const getFilesChecked = (file, selected) => {
  const type = file.fileType;
  switch (selected) {
    case "all":
      return true;
    case FilterType.FoldersOnly.toString():
      return file.parentId;
    case FilterType.DocumentsOnly.toString():
      return type === FileType.Document;
    case FilterType.PresentationsOnly.toString():
      return type === FileType.Presentation;
    case FilterType.SpreadsheetsOnly.toString():
      return type === FileType.Spreadsheet;
    case FilterType.ImagesOnly.toString():
      return type === FileType.Image;
    case FilterType.MediaOnly.toString():
      return type === FileType.Video || type === FileType.Audio;
    case FilterType.ArchiveOnly.toString():
      return type === FileType.Archive;
    case FilterType.FilesOnly.toString():
      return type || !file.parentId;
    default:
      return false;
  }
};

export const getTitleWithoutExst = (item) => {
  return item.fileExst
    ? item.title.split(".").slice(0, -1).join(".")
    : item.title;
};

export const createTreeFolders = (pathParts, filterData) => {
  let treeFolders = [];
  if (pathParts.length > 0) {
    for (let item of pathParts) {
      treeFolders.push(item.toString());
    }
  }
  if (treeFolders.length > 0) {
    treeFolders = treeFolders.concat(
      filterData.treeFolders.filter((x) => !treeFolders.includes(x))
    );
  }
  return treeFolders;
};

const renameTreeFolder = (folders, newItems, currentFolder) => {
  const newItem = folders.find((x) => x.id === currentFolder.id);
  const oldItemIndex = newItems.folders.findIndex(
    (x) => x.id === currentFolder.id
  );
  newItem.folders = newItems.folders[oldItemIndex].folders;
  newItems.folders[oldItemIndex] = newItem;

  return;
};

const removeTreeFolder = (folders, newItems, foldersCount) => {
  const newFolders = JSON.parse(JSON.stringify(newItems.folders));
  for (let folder of newFolders) {
    let currentFolder;
    if (folders) {
      currentFolder = folders.find((x) => x.id === folder.id);
    }

    if (!currentFolder) {
      const arrayFolders = newItems.folders.filter((x) => x.id !== folder.id);
      newItems.folders = arrayFolders;
      newItems.foldersCount = foldersCount;
    }
  }
};

const addTreeFolder = (folders, newItems, foldersCount) => {
  let array;
  let newItemFolders = newItems.folders ? newItems.folders : [];
  for (let folder of folders) {
    let currentFolder;
    if (newItemFolders) {
      currentFolder = newItemFolders.find((x) => x.id === folder.id);
    }

    if (folders.length < 1 || !currentFolder) {
      array = [...newItemFolders, ...[folder]].sort((prev, next) =>
        prev.title.toLowerCase() < next.title.toLowerCase() ? -1 : 1
      );
      newItems.folders = array;
      newItemFolders = array;
      newItems.foldersCount = foldersCount;
    }
  }
};

export const loopTreeFolders = (
  path,
  item,
  folders,
  foldersCount,
  currentFolder
) => {
  const newPath = path;
  while (path.length !== 0) {
    const newItems = item.find((x) => x.id === path[0]);
    if (!newItems) {
      return;
    }
    newPath.shift();
    if (path.length === 0) {
      let foldersLength = newItems.folders ? newItems.folders.length : 0;
      if (folders.length > foldersLength) {
        addTreeFolder(folders, newItems, foldersCount);
      } else if (folders.length < foldersLength) {
        removeTreeFolder(folders, newItems, foldersCount);
      } else if (
        folders.length > 0 &&
        newItems.folders.length > 0 &&
        currentFolder
      ) {
        renameTreeFolder(folders, newItems, currentFolder);
      } else {
        return;
      }
      return;
    }
    loopTreeFolders(
      newPath,
      newItems.folders,
      folders,
      foldersCount,
      currentFolder
    );
  }
};

export const getSelectedFolder = (state) => {
  return state.files.selectedFolder;
};

export const getSelectedFolderId = (state) => {
  return state.files.selectedFolder.id;
};

export const getSelectedFolderParentId = (state) => {
  return state.files.selectedFolder.parentId;
};

export const getSelectedFolderProviderItem = (state) => {
  return state.files.selectedFolder.providerItem;
};

export const getSelectedFolderNew = (state) => {
  return state.files.selectedFolder.new;
};

export const getSelectedFolderTitle = (state) => {
  return state.files.selectedFolder.title;
};

export const getPathParts = (state) => {
  return state.files.selectedFolder.pathParts;
};

export const getSelectedFolderRootFolderType = (state) => {
  return state.files.selectedFolder.rootFolderType;
};

const getSelectedFolderAccess = (state) => {
  return state.files.selectedFolder.access;
};

export const getIsRootFolder = (state) => {
  return state.files.selectedFolder.parentId === 0;
};

export const getRootFolderId = (state) => {
  if (state.files.selectedFolder.rootFolderType)
    return state.files.selectedFolder.rootFolderType;
};

export const isRootFolder = createSelector(getPathParts, (pathParts) => {
  return pathParts && pathParts.length <= 1;
});

export const canCreate = createSelector(
  getSelectedFolderRootFolderType,
  isAdmin,
  isRootFolder,
  getSelectedFolderAccess,
  isEncryptionSupport,
  isDesktopClient,
  (folderType, isAdmin, isRootFolder, access, isSupport, isDesktop) => {
    switch (folderType) {
      case FolderType.USER:
        return true;
      case FolderType.SHARE:
        const canCreateInSharedFolder = access === 1;
        return !isRootFolder && canCreateInSharedFolder;
      case FolderType.Privacy:
        return isDesktop && isSupport;
      case FolderType.COMMON:
        return isAdmin;
      case FolderType.TRASH:
      default:
        return false;
    }
  }
);

//TODO: Get the whole list of extensions
export const getAccessOption = (state, selection) => {
  return getOptions(state, selection);
};

export const getExternalAccessOption = (state, selection) => {
  return getOptions(state, selection, true);
};

const getOptions = (state, selection, externalAccess = false) => {
  const webEdit = selection.find((x) => canWebEdit(x.fileExst)(state));
  const webComment = selection.find((x) => canWebComment(x.fileExst)(state));
  const webReview = selection.find((x) => canWebReview(x.fileExst)(state));
  const formFillingDocs = selection.find((x) =>
    canFormFillingDocs(x.fileExst)(state)
  );
  const webFilter = selection.find((x) =>
    canWebFilterEditing(x.fileExst)(state)
  );

  let AccessOptions = [];

  if (webEdit || !externalAccess) AccessOptions.push("FullAccess");

  AccessOptions.push("ReadOnly", "DenyAccess");

  if (webComment) AccessOptions.push("Comment");
  if (webReview) AccessOptions.push("Review");
  if (formFillingDocs) AccessOptions.push("FormFilling");
  if (webFilter) AccessOptions.push("FilterEditing");
  return AccessOptions;
};

export const getFolderIcon = (providerKey, size = 32) => {
  const folderPath = `images/icons/${size}`;

  switch (providerKey) {
    case "Box":
    case "BoxNet":
      return `${folderPath}/folder/box.svg`;
    case "DropBox":
    case "DropboxV2":
      return `${folderPath}/folder/dropbox.svg`;
    case "Google":
    case "GoogleDrive":
      return `${folderPath}/folder/google.svg`;
    case "OneDrive":
      return `${folderPath}/folder/onedrive.svg`;
    case "SharePoint":
      return `${folderPath}/folder/sharepoint.svg`;
    case "Yandex":
      return `${folderPath}/folder/yandex.svg`;
    case "kDrive":
      return `${folderPath}/folder/kdrive.svg`;
    case "WebDav":
      return `${folderPath}/folder/webdav.svg`;
    default:
      return `${folderPath}/folder.svg`;
  }
};

export const getFileIcon = (
  extension,
  size = 32,
  archive = false,
  image = false,
  sound = false,
  html = false
) => {
  const folderPath = `images/icons/${size}`;

  if (archive) return `${folderPath}/file_archive.svg`;

  if (image) return `${folderPath}/image.svg`;

  if (sound) return `${folderPath}/sound.svg`;

  if (html) return `${folderPath}/html.svg`;

  switch (extension) {
    case ".avi":
      return `${folderPath}/avi.svg`;
    case ".csv":
      return `${folderPath}/csv.svg`;
    case ".djvu":
      return `${folderPath}/djvu.svg`;
    case ".doc":
      return `${folderPath}/doc.svg`;
    case ".docx":
      return `${folderPath}/docx.svg`;
    case ".dvd":
      return `${folderPath}/dvd.svg`;
    case ".epub":
      return `${folderPath}/epub.svg`;
    case ".pb2":
      return `${folderPath}/fb2.svg`;
    case ".flv":
      return `${folderPath}/flv.svg`;
    case ".iaf":
      return `${folderPath}/iaf.svg`;
    case ".m2ts":
      return `${folderPath}/m2ts.svg`;
    case ".mht":
      return `${folderPath}/mht.svg`;
    case ".mkv":
      return `${folderPath}/mkv.svg`;
    case ".mov":
      return `${folderPath}/mov.svg`;
    case ".mp4":
      return `${folderPath}/mp4.svg`;
    case ".mpg":
      return `${folderPath}/mpg.svg`;
    case ".odp":
      return `${folderPath}/odp.svg`;
    case ".ods":
      return `${folderPath}/ods.svg`;
    case ".odt":
      return `${folderPath}/odt.svg`;
    case ".pdf":
      return `${folderPath}/pdf.svg`;
    case ".pps":
      return `${folderPath}/pps.svg`;
    case ".ppsx":
      return `${folderPath}/ppsx.svg`;
    case ".ppt":
      return `${folderPath}/ppt.svg`;
    case ".pptx":
      return `${folderPath}/pptx.svg`;
    case ".rtf":
      return `${folderPath}/rtf.svg`;
    case ".svg":
      return `${folderPath}/svg.svg`;
    case ".txt":
      return `${folderPath}/txt.svg`;
    case ".webm":
      return `${folderPath}/webm.svg`;
    case ".xls":
      return `${folderPath}/xls.svg`;
    case ".xlsx":
      return `${folderPath}/xlsx.svg`;
    case ".xps":
      return `${folderPath}/xps.svg`;
    case ".xml":
      return `${folderPath}/xml.svg`;
    default:
      return `${folderPath}/file.svg`;
  }
};

export const getFileAction = (state) => {
  return state.files.fileAction;
};

export const getFiles = (state) => {
  return state.files.files;
};

export const getFolders = (state) => {
  return state.files.folders;
};

export const getFilter = (state) => {
  return state.files.filter;
};

export const getNewRowItems = (state) => {
  return state.files.newRowItems;
};

export const getSelected = (state) => {
  return state.files.selected;
};

const getSelectionSelector = (state) => {
  return state.files.selection;
};

export const getSelection = createSelector(
  getSelectionSelector,
  (selection) => {
    return selection;
  }
);

export const getSelectionLength = (state) => {
  return state.files.selection.length;
};

export const getSelectionTitle = createSelector(getSelection, (selection) => {
  if (selection.length === 0) return null;
  return selection.find((el) => el.title).title;
});

export const getViewAs = (state) => {
  return state.files.viewAs;
};

export const getTreeFolders = (state) => {
  return state.files.treeFolders;
};

export const getServiceFilesCount = (state) => {
  const { files, folders } = state.files;
  const filesLength = files ? files.length : 0;
  const foldersLength = folders ? folders.length : 0;
  return filesLength + foldersLength;
};

export const getFilesCount = (state) => {
  const { selectedFolder, folders } = state.files;
  const { filesCount, foldersCount } = selectedFolder;
  return filesCount + folders ? folders.length : foldersCount;
};

export const getCurrentFilesCount = createSelector(
  getSelectedFolderProviderItem,
  getFilesCount,
  getServiceFilesCount,
  (providerItem, filesCount, serviceFilesCount) => {
    return providerItem ? serviceFilesCount : filesCount;
  }
);

export const getDragItem = (state) => {
  return state.files.dragItem;
};

export const getMediaViewerVisibility = (state) => {
  return state.files.mediaViewerData.visible;
};

export const getMediaViewerId = (state) => {
  return state.files.mediaViewerData.id;
};

export const getDragging = (state) => {
  return state.files.dragging;
};

export const getIsLoading = (state) => {
  return state.files.isLoading;
};

export const getFirstLoad = (state) => {
  return state.files.firstLoad;
};

export const isMediaOrImage = (fileExst) => {
  return createSelector(
    [getMediaViewerImageFormats, getMediaViewerMediaFormats],
    (media, images) => {
      if (media.includes(fileExst) || images.includes(fileExst)) {
        return true;
      }
      return false;
    }
  );
};

const getFilesContextOptions = (
  item,
  isRecycleBin,
  isRecent,
  isFavorites,
  isVisitor,
  canOpenPlayer,
  canChangeOwner,
  haveAccess,
  canShare,
  isPrivacy,
  isRootFolder
) => {
  const options = [];

  const isFile = !!item.fileExst;
  const isFavorite = item.fileStatus === 32;
  const isFullAccess = item.access < 2;
  const isThirdPartyFolder = item.providerKey && isRootFolder;

  if (item.id <= 0) return [];

  if (isRecycleBin) {
    options.push("download");
    options.push("download-as");
    options.push("restore");
    options.push("separator0");
    options.push("delete");
  } else if (isPrivacy) {
    if (isFile) {
      options.push("sharing-settings");
      options.push("separator0");
      options.push("show-version-history");
      options.push("separator1");
    }
    options.push("download");
    options.push("move");
    options.push("rename");
    options.push("separator2");
    options.push("delete");
  } else {
    if (!isFile) {
      options.push("open");
      options.push("separator0");
    }

    //TODO: use canShare selector
    if (/*!(isRecent || isFavorites || isVisitor) && */ canShare) {
      options.push("sharing-settings");
    }

    if (isFile && !isVisitor) {
      options.push("send-by-email");
    }

    canChangeOwner && options.push("owner-change");
    options.push("link-for-portal-users");

    if (!isVisitor) {
      options.push("separator1");
    }

    if (isFile) {
      options.push("show-version-history");
      if (!isVisitor) {
        if (isFullAccess && !item.providerKey && !canOpenPlayer) {
          options.push("finalize-version");
          options.push("block-unblock-version");
        }
        options.push("separator2");

        if (isRecent) {
          options.push("open-location");
        }
        if (!isFavorite) {
          options.push("mark-as-favorite");
        }
      } else {
        options.push("separator3");
      }

      if (canOpenPlayer) {
        options.push("view");
      } else {
        options.push("edit");
        options.push("preview");
      }

      options.push("download");
    }

    if (!isVisitor) {
      !isThirdPartyFolder && haveAccess && options.push("move");
      options.push("copy");

      if (isFile) {
        options.push("duplicate");
      }

      haveAccess && options.push("rename");
      isThirdPartyFolder &&
        haveAccess &&
        options.push("change-thirdparty-info");
      options.push("separator3");
      haveAccess && options.push("delete");
    } else {
      options.push("copy");
    }
  }

  if (isFavorite && !isRecycleBin) {
    options.push("remove-from-favorites");
  }

  return options;
};

export const getItemsList = createSelector(
  [getFolders, getFiles],
  (folders, files) => {
    const items =
      folders && files
        ? [...folders, ...files]
        : folders
        ? folders
        : files
        ? files
        : [];
    return items;
  }
);

const getMyFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@my");
});

const getShareFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@share");
});

const getCommonFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@common");
});

const getRecycleBinFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@trash");
});

const getFavoritesFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@favorites");
});

const getRecentFolder = createSelector(getTreeFolders, (treeFolders) => {
  return treeFolders.find((x) => x.rootFolderName === "@recent");
});

export const getMyFolderId = createSelector(getMyFolder, (myFolder) => {
  if (myFolder) return myFolder.id;
});

export const getMyDirectoryFolders = createSelector(getMyFolder, (myFolder) => {
  if (myFolder) return myFolder.folders;
});

export const getCommonDirectoryFolders = createSelector(
  getCommonFolder,
  (commonFolder) => {
    if (commonFolder) return commonFolder.folders;
  }
);

export const getShareFolderId = createSelector(
  getShareFolder,
  (shareFolder) => {
    if (shareFolder) return shareFolder.id;
  }
);

export const getCommonFolderId = createSelector(
  getCommonFolder,
  (commonFolder) => {
    if (commonFolder) return commonFolder.id;
  }
);

export const getRecycleBinFolderId = createSelector(
  getRecycleBinFolder,
  (recycleBinFolder) => {
    if (recycleBinFolder) return recycleBinFolder.id;
  }
);

export const getFavoritesFolderId = createSelector(
  getFavoritesFolder,
  (favoritesFolder) => {
    if (favoritesFolder) return favoritesFolder.id;
  }
);

export const getRecentFolderId = createSelector(
  getRecentFolder,
  (recentFolder) => {
    if (recentFolder) return recentFolder.id;
  }
);

export const getIsMyFolder = createSelector(
  getMyFolder,
  getSelectedFolderId,
  (myFolder, id) => {
    return myFolder && myFolder.id === id;
  }
);

export const getIsShareFolder = createSelector(
  getShareFolder,
  getSelectedFolderId,
  (shareFolder, id) => {
    return shareFolder && shareFolder.id === id;
  }
);

export const getIsCommonFolder = createSelector(
  getCommonFolder,
  getSelectedFolderId,
  (commonFolder, id) => {
    return commonFolder && commonFolder.id === id;
  }
);

export const getIsRecycleBinFolder = createSelector(
  getRecycleBinFolder,
  getSelectedFolderId,
  (recycleBinFolder, id) => {
    return recycleBinFolder && recycleBinFolder.id === id;
  }
);

export const getIsFavoritesFolder = createSelector(
  getFavoritesFolder,
  getSelectedFolderId,
  (favoritesFolder, id) => {
    return favoritesFolder && favoritesFolder.id === id;
  }
);

export const getIsRecentFolder = createSelector(
  getRecentFolder,
  getSelectedFolderId,
  (recentFolder, id) => {
    return recentFolder && recentFolder.id === id;
  }
);

export const getPrivacyFolder = createSelector(
  getTreeFolders,
  (treeFolders) => {
    return treeFolders.find((x) => x.rootFolderType === FolderType.Privacy);
  }
);

export const getIsPrivacyFolder = createSelector(
  getPrivacyFolder,
  getSelectedFolderRootFolderType,
  (privacyFolder, id) => {
    return privacyFolder && privacyFolder.rootFolderType === id;
  }
);

export const getFileActionId = (state) => {
  return state.files.fileAction.id;
};

export const getFilesList = (state) => {
  return createSelector(
    [
      getFolders,
      getFiles,
      getSelection,
      getIsRecycleBinFolder,
      getIsRecentFolder,
      getIsFavoritesFolder,
      getFileActionId,
      isVisitor,
      getCanShareOwnerChange,
      getUserAccess,
      isCanShare,
      getIsPrivacyFolder,
      isRootFolder,
    ],
    (
      folders,
      files,
      selection,
      isRecycleBin,
      isRecent,
      isFavorites,
      actionId,
      isVisitor,
      canChangeOwner,
      haveAccess,
      canShare,
      isPrivacy,
      isRootFolder
    ) => {
      const items =
        folders && files
          ? [...folders, ...files]
          : folders
          ? folders
          : files
          ? files
          : [];
      return items.map((item) => {
        const {
          access,
          comment,
          contentLength,
          created,
          createdBy,
          fileExst,
          filesCount,
          fileStatus,
          fileType,
          folderId,
          foldersCount,
          id,
          locked,
          parentId,
          pureContentLength,
          rootFolderType,
          shared,
          title,
          updated,
          updatedBy,
          version,
          versionGroup,
          viewUrl,
          webUrl,
          providerKey,
        } = item;

        const canOpenPlayer = isMediaOrImage(item.fileExst)(state);
        const contextOptions = getFilesContextOptions(
          item,
          isRecycleBin,
          isRecent,
          isFavorites,
          isVisitor,
          canOpenPlayer,
          canChangeOwner,
          haveAccess,
          canShare,
          isPrivacy,
          isRootFolder
        );
        const checked = isFileSelected(selection, id, parentId);

        const selectedItem = selection.find((x) => x.id === id && x.fileExst);
        const isFolder = selectedItem ? false : fileExst ? false : true;

        const draggable =
          selectedItem && !isRecycleBin && selectedItem.id !== actionId;

        let value = fileExst ? `file_${id}` : `folder_${id}`;

        const isCanWebEdit = canWebEdit(item.fileExst)(state);

        const icon = getIcon(state, 24, fileExst, providerKey);

        //TODO: use canShare selector
        /*const canShare = !(
          isRecycleBin ||
          isFavorites ||
          isRecent ||
          isVisitor
        );*/

        value += draggable ? "_draggable" : "";

        return {
          access,
          checked,
          comment,
          contentLength,
          contextOptions,
          created,
          createdBy,
          fileExst,
          filesCount,
          fileStatus,
          fileType,
          folderId,
          foldersCount,
          icon,
          id,
          isFolder,
          locked,
          new: item.new,
          parentId,
          pureContentLength,
          rootFolderType,
          selectedItem,
          shared,
          title,
          updated,
          updatedBy,
          value,
          version,
          versionGroup,
          viewUrl,
          webUrl,
          providerKey,
          draggable,
          canOpenPlayer,
          canWebEdit: isCanWebEdit,
          canShare,
        };
      });
    }
  );
};

export const getSelectedTreeNode = createSelector(getSelectedFolderId, (id) => {
  if (id) return [id.toString()];
});

export const getConvertDialogVisible = (state) => {
  return state.files.convertDialogVisible;
};

export const getPrimaryProgressData = (state) => {
  return state.files.primaryProgressData;
};

export const getSecondaryProgressData = (state) => {
  return state.files.secondaryProgressData;
};

export const getUpdateTree = (state) => {
  return state.files.updateTree;
};

export const getSettingsSelectedTreeNode = (state) => {
  return state.files.selectedTreeNode;
};

export const getSettingsTreeStoreOriginalFiles = (state) => {
  return state.files.settingsTree.storeOriginalFiles;
};

export const getSettingsTreeConfirmDelete = (state) => {
  return state.files.settingsTree.confirmDelete;
};

export const getSettingsTreeUpdateIfExist = (state) => {
  return state.files.settingsTree.updateIfExist;
};

export const getSettingsTreeForceSave = (state) => {
  return state.files.settingsTree.forceSave;
};

export const getSettingsTreeStoreForceSave = (state) => {
  return state.files.settingsTree.storeForceSave;
};

export const getSettingsTreeEnableThirdParty = (state) => {
  return state.files.settingsTree.enableThirdParty;
};

export const getExpandedSetting = (state) => {
  return state.files.settingsTree.expandedSetting;
};

export const getEnableThirdParty = (state) => {
  return state.files.settingsTree.enableThirdParty;
};

export const getFilterSelectedItem = (state) => {
  return state.files.filter.selectedItem;
};

export const getPrivacyInstructionsLink = (state) => {
  return state.files.privacyInstructions;
};

export const getIsVerHistoryPanel = (state) => {
  return state.files.versionHistory.isVisible;
};

export const getVerHistoryFileId = (state) => {
  return state.files.versionHistory.fileId;
};

export const getFileVersions = (state) => {
  return state.files.versionHistory.versions;
};

export const getHeaderVisible = createSelector(
  getSelectionLength,
  getSelected,
  (selectionLength, selected) => {
    return selectionLength > 0 || selected !== "close";
  }
);

export const getHeaderIndeterminate = createSelector(
  getHeaderVisible,
  getSelectionLength,
  getItemsList,
  (headerVisible, selectionLength, items) => {
    return headerVisible && selectionLength
      ? selectionLength < items.length
      : false;
  }
);

export const getHeaderChecked = createSelector(
  getHeaderVisible,
  getSelectionLength,
  getItemsList,
  (headerVisible, selectionLength, items) => {
    return headerVisible && selectionLength === items.length;
  }
);

export const getDraggableItems = createSelector(
  getSelection,
  getDragging,
  (selection, dragging) => {
    if (dragging) {
      return selection;
    } else {
      return false;
    }
  }
);

const getSettingsTreeSelector = (state) => {
  return state.files.settingsTree;
};

export const getSettingsTree = createSelector(
  getSettingsTreeSelector,
  (settingsTree) => {
    if (Object.keys(settingsTree).length !== 0) {
      return settingsTree;
    }
    return {};
  }
);

export const getTooltipLabel = createSelector(
  getSelectionLength,
  isAdmin,
  getIsShareFolder,
  getIsCommonFolder,
  getSelection,
  getDragging,
  (selectionLength, isAdmin, isShare, isCommon, selection, dragging) => {
    if (!dragging) return null;

    const elementTitle = selectionLength && selection[0].title;
    const singleElement = selectionLength === 1;
    const filesCount = singleElement ? elementTitle : selectionLength;

    let operationName;

    if (isAdmin && isShare) {
      operationName = "copy";
    } else if (!isAdmin && (isShare || isCommon)) {
      operationName = "copy";
    } else {
      operationName = "move";
    }

    return operationName === "copy"
      ? singleElement
        ? { label: "TooltipElementCopyMessage", filesCount }
        : { label: "TooltipElementsCopyMessage", filesCount }
      : singleElement
      ? { label: "TooltipElementMoveMessage", filesCount }
      : { label: "TooltipElementsMoveMessage", filesCount };
  }
);

export const getOnlyFoldersSelected = createSelector(
  getSelection,
  (selection) => {
    return selection.every((selected) => selected.isFolder === true);
  }
);

export const getWebEditSelected = createSelector(
  getSelection,
  getEditedFormats,
  (selection, editedFormats) => {
    return selection.some((selected) => {
      if (selected.isFolder === true || !selected.fileExst) return false;
      return editedFormats.find((format) => selected.fileExst === format);
    });
  }
);

export const getAccessedSelected = createSelector(
  getSelection,
  getSelectionLength,
  isAdmin,
  (selection, selectionLength, isAdmin) => {
    return (
      selectionLength &&
      isAdmin &&
      selection.every((x) => x.access === 1 || x.access === 0)
    );
  }
);

export const getOperationsFolders = createSelector(
  getTreeFolders,
  getIsPrivacyFolder,
  (treeFolders, isPrivacy) => {
    if (isPrivacy) {
      return treeFolders.filter(
        (folder) => folder.rootFolderType === FolderType.Privacy && folder
      );
    } else {
      return treeFolders.filter(
        (folder) =>
          (folder.rootFolderType === FolderType.USER ||
            folder.rootFolderType === FolderType.COMMON ||
            folder.rootFolderType === FolderType.Projects) &&
          folder
      );
    }
  }
);
const getIcon = (state, size = 24, fileExst = null, providerKey = null) => {
  if (fileExst) {
    const isArchiveItem = isArchive(fileExst)(state);
    const isImageItem = isImage(fileExst)(state);
    const isSoundItem = isSound(fileExst)(state);
    const isHtmlItem = isHtml(fileExst)(state);

    const icon = getFileIcon(
      fileExst,
      size,
      isArchiveItem,
      isImageItem,
      isSoundItem,
      isHtmlItem
    );

    return icon;
  } else {
    return getFolderIcon(providerKey, size);
  }
};

export const getIconOfDraggedFile = (state) => {
  return createSelector(getSelection, (selection) => {
    if (selection.length === 1) {
      const icon = getIcon(
        state,
        24,
        selection[0].fileExst,
        selection[0].providerKey
      );

      return icon;
    }
    return;
  });
};

export const getSharePanelVisible = (state) => {
  return state.files.sharingPanelVisible;
};

export const getThirdPartyCapabilities = (state) => {
  return state.files.capabilities;
};

export const getThirdPartyProviders = (state) => {
  return state.files.providers;
};

export const getGoogleConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "GoogleDrive");
  }
);

export const getBoxConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "Box");
  }
);

export const getDropboxConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "DropboxV2");
  }
);
export const getOneDriveConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "OneDrive");
  }
);

export const getSharePointConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "SharePoint");
  }
);

export const getkDriveConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "kDrive");
  }
);

export const getYandexConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "Yandex");
  }
);

export const getWebDavConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "WebDav");
  }
);

// TODO: remove WebDav get NextCloud
export const getNextCloudConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "WebDav");
    //return capabilities.find((x) => x[0] === "NextCloud");
  }
);
// TODO:remove WebDav get OwnCloud
export const getOwnCloudConnect = createSelector(
  getThirdPartyCapabilities,
  (capabilities) => {
    return capabilities.find((x) => x[0] === "WebDav");
    //return capabilities.find((x) => x[0] === "OwnCloud");
  }
);

export const getConnectItem = (state) => {
  return state.files.connectItem;
};

export const getShowThirdPartyPanel = (state) => {
  return state.files.showThirdPartyPanel;
};

export const getIsThirdPartySelection = createSelector(
  getSelectionSelector,
  isRootFolder,
  (selection, isRootItem) => {
    const withProvider = selection && selection.find((x) => !x.providerKey);
    return !withProvider && isRootItem;
  }
);

export const getCanShareOwnerChange = createSelector(
  isAdmin,
  getPathParts,
  getCommonFolderId,
  getCurrentUserId,
  getSelectionSelector,

  (isAdmin, pathParts, commonId, userId, selection) => {
    return (
      (isAdmin || (selection.length && selection[0].createdBy.id === userId)) &&
      pathParts &&
      commonId === pathParts[0] &&
      selection.length &&
      !selection[0].providerKey
    );
  }
);

export const isSecondaryProgressFinished = createSelector(
  getSecondaryProgressData,
  (data) => {
    return data && data.percent === 100;
  }
);

export const getSortedFiles = (state) => {
  const formatKeys = Object.freeze({
    OriginalFormat: 0,
  });

  const items = getSelection(state);

  let sortedFiles = {
    documents: [],
    spreadsheets: [],
    presentations: [],
    other: [],
  };

  for (let item of items) {
    item.checked = true;
    item.format = formatKeys.OriginalFormat;

    if (item.fileExst) {
      if (isSpreadsheet(item.fileExst)(state)) {
        sortedFiles.spreadsheets.push(item);
      } else if (isPresentation(item.fileExst)(state)) {
        sortedFiles.presentations.push(item);
      } else if (item.fileExst !== ".pdf" && canWebEdit(item.fileExst)(state)) {
        sortedFiles.documents.push(item);
      } else {
        sortedFiles.other.push(item);
      }
    } else {
      sortedFiles.other.push(item);
    }
  }

  return sortedFiles;
};

export const getShowOwnerChangePanel = (state) => {
  return state.files.ownerPanelVisible;
};

export const getUserAccess = createSelector(
  getSelectedFolderRootFolderType,
  isAdmin,
  getSelectionSelector,
  (folderType, isAdmin, selection) => {
    switch (folderType) {
      case FolderType.USER:
        return true;
      case FolderType.SHARE:
        return false;
      case FolderType.COMMON:
        return (
          isAdmin || selection.some((x) => x.access === 0 || x.access === 1)
        );
      case FolderType.Privacy:
        return true;
      case FolderType.TRASH:
        return true;
      default:
        return false;
    }
  }
);

export const isCanShare = createSelector(
  getSelectedFolderRootFolderType,
  isAdmin,
  isVisitor,
  (folderType, isAdmin, isVisitor) => {
    if (isVisitor) {
      return false;
    }

    switch (folderType) {
      case FolderType.USER:
        return true;
      case FolderType.SHARE:
        return false;
      case FolderType.COMMON:
        return isAdmin;
      case FolderType.TRASH:
        return false;
      case FolderType.Favorites:
        return false;
      case FolderType.Recent:
        return false;
      case FolderType.Privacy:
        return true;
      default:
        return false;
    }
  }
);

export const getUploadPanelVisible = (state) => {
  return state.files.uploadPanelVisible;
};

export const getUploadData = (state) => {
  return state.files.uploadData;
};

export const isUploaded = createSelector(getUploadData, (data) => {
  return data.uploaded;
});

export const getUploadDataFiles = (state) => {
  return state.files.uploadData.files;
};

export const getLoadingFile = createSelector(
  getPrimaryProgressData,
  (primaryProgressData) => {
    const { loadingFile } = primaryProgressData;
    if (!loadingFile || !loadingFile.uniqueId) return null;
    return loadingFile;
  }
);

export const getFileByFileId = (state, fileId) => {
  return state.files.files.find((file) => file.id === fileId);
};

// export const getUploadItem = (fileExst) => {
//   return createSelector(
//     [getMediaViewerImageFormats, getMediaViewerMediaFormats],
//     (media, images) => {
//       if (media.includes(fileExst) || images.includes(fileExst)) {
//         return true;
//       }
//       return false;
//     }
//   );
// };

export const getIconSrc = (ext, size = 24) => {
  return createSelector(
    getArchiveFormats,
    getImageFormats,
    getSoundFormats,
    getHtmlFormats,
    (archiveFormats, imageFormats, soundFormats, htmlFormats) => {
      const folderPath = `images/icons/${size}`;

      if (presentInArray(archiveFormats, ext, true))
        return `${folderPath}/file_archive.svg`;

      if (presentInArray(imageFormats, ext, true))
        return `${folderPath}/image.svg`;

      if (presentInArray(soundFormats, ext, true))
        return `${folderPath}/sound.svg`;

      if (presentInArray(htmlFormats, ext, true))
        return `${folderPath}/html.svg`;

      const extension = ext.toLowerCase();

      switch (extension) {
        case ".avi":
          return `${folderPath}/avi.svg`;
        case ".csv":
          return `${folderPath}/csv.svg`;
        case ".djvu":
          return `${folderPath}/djvu.svg`;
        case ".doc":
          return `${folderPath}/doc.svg`;
        case ".docx":
          return `${folderPath}/docx.svg`;
        case ".dvd":
          return `${folderPath}/dvd.svg`;
        case ".epub":
          return `${folderPath}/epub.svg`;
        case ".pb2":
          return `${folderPath}/fb2.svg`;
        case ".flv":
          return `${folderPath}/flv.svg`;
        case ".iaf":
          return `${folderPath}/iaf.svg`;
        case ".m2ts":
          return `${folderPath}/m2ts.svg`;
        case ".mht":
          return `${folderPath}/mht.svg`;
        case ".mkv":
          return `${folderPath}/mkv.svg`;
        case ".mov":
          return `${folderPath}/mov.svg`;
        case ".mp4":
          return `${folderPath}/mp4.svg`;
        case ".mpg":
          return `${folderPath}/mpg.svg`;
        case ".odp":
          return `${folderPath}/odp.svg`;
        case ".ods":
          return `${folderPath}/ods.svg`;
        case ".odt":
          return `${folderPath}/odt.svg`;
        case ".pdf":
          return `${folderPath}/pdf.svg`;
        case ".pps":
          return `${folderPath}/pps.svg`;
        case ".ppsx":
          return `${folderPath}/ppsx.svg`;
        case ".ppt":
          return `${folderPath}/ppt.svg`;
        case ".pptx":
          return `${folderPath}/pptx.svg`;
        case ".rtf":
          return `${folderPath}/rtf.svg`;
        case ".svg":
          return `${folderPath}/svg.svg`;
        case ".txt":
          return `${folderPath}/txt.svg`;
        case ".webm":
          return `${folderPath}/webm.svg`;
        case ".xls":
          return `${folderPath}/xls.svg`;
        case ".xlsx":
          return `${folderPath}/xlsx.svg`;
        case ".xps":
          return `${folderPath}/xps.svg`;
        case ".xml":
          return `${folderPath}/xml.svg`;
        default:
          return `${folderPath}/file.svg`;
      }
    }
  );
};

export const getUploadedFile = (id) => {
  return createSelector(getUploadDataFiles, (files) => {
    return files.filter((f) => f.uniqueId === id);
  });
};

export const getUploadSelection = (state) => {
  return state.files.selectedUploadFile;
};
