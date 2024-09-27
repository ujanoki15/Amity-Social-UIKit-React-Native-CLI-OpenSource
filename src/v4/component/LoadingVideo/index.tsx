/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Platform } from 'react-native';
import * as Progress from 'react-native-progress';
import { SvgXml } from 'react-native-svg';
import {
  deleteAmityFile,
  uploadVideoFile,
} from '../../../providers/file-provider';
import { closeIcon, playBtn, toastIcon } from '../../../svg/svg-xml-list';
import { useStyles } from './styles';
import { createThumbnail, type Thumbnail } from 'react-native-create-thumbnail';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { useDispatch } from 'react-redux';
import uiSlice from '../../../redux/slices/uiSlice';

interface OverlayImageProps {
  source: string;
  onClose?: (originalPath: string, fileId?: string, postId?: string) => void;
  onLoadFinish?: (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string,
    thumbNail: string
  ) => void;
  index?: number;
  isUploaded: boolean;
  fileId?: string;
  thumbNail: string;
  onPlay?: (fileUrl: string) => void;
  isEditMode?: boolean;
  fileCount?: number;
  postId?: string;
  setIsUploading?: (arg: boolean) => void;
}
const LoadingVideo = ({
  source,
  onClose,
  index,
  onLoadFinish,
  isUploaded = false,
  thumbNail,
  onPlay,
  fileId,
  isEditMode = false,
  fileCount,
  postId,
  setIsUploading,
}: OverlayImageProps) => {
  const theme = useTheme() as MyMD3Theme;
  const dispatch = useDispatch();
  const { showToastMessage } = uiSlice.actions;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [thumbNailImage, setThumbNailImage] = useState(thumbNail ?? '');
  const styles = useStyles();
  const [playingUri, setPlayingUri] = useState<string>('');
  const [isPause, setIsPause] = useState<boolean>(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const playVideoFullScreen = (fileUrl: string) => {
    if (Platform.OS === 'ios') {
      setPlayingUri(fileUrl);
    } else {
      setIsPause(true);
      navigation.navigate('VideoPlayer', { source: source });
    }
  };
  const onClosePlayer = () => {
    setIsPause(true);
    setPlayingUri('');
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setIsUploading(false);
  };

  const processThumbNail = async () => {
    const thumbNail: Thumbnail = await createThumbnail({
      url: source,
    });
    setThumbNailImage(thumbNail.path);
  };
  useEffect(() => {
    processThumbNail();
  }, [thumbNail]);

  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {
    setIsUploading(true);
    setIsUploadError(false);
    try {
      const file: Amity.File<any>[] = await uploadVideoFile(
        source,
        (percent: number) => {
          setProgress(percent);
        }
      );
      if (file) {
        setIsProcess(false);
        handleLoadEnd();
        onLoadFinish &&
          onLoadFinish(
            file[0]?.fileId as string,
            file[0]?.fileUrl as string,
            file[0]?.attributes.name as string,
            index as number,
            source,
            thumbNail
          );
      } else {
        handleLoadEnd();
        dispatch(showToastMessage({ toastMessage: 'Failed to upload file' }));
        setIsUploadError(true);
      }
    } catch (error) {
      handleLoadEnd();
      dispatch(showToastMessage({ toastMessage: 'Failed to upload file' }));
      setIsUploadError(true);
    }
  }, [source]);

  const handleDelete = async () => {
    if (!fileId) return null;
    if (!isEditMode) {
      await deleteAmityFile(fileId);
    }
    onClose && onClose(source, fileId, postId);
  };
  useEffect(() => {
    if (isUploaded) {
      setLoading(false);
    } else {
      uploadFileToAmity();
    }
  }, [fileId, isUploaded, source]);

  const handleOnPlay = () => {
    setIsPause(!isPause);
    playVideoFullScreen(source);
    onPlay && onPlay(source);
  };

  const onRetryUpload = () => {
    uploadFileToAmity();
  };

  return (
    <View style={fileCount >= 3 ? styles.image3XContainer : styles.container}>
      {!loading && !isUploadError && isPause && (
        <TouchableOpacity style={styles.playButton} onPress={handleOnPlay}>
          <SvgXml xml={playBtn} width="50" height="50" />
        </TouchableOpacity>
      )}
      {playingUri && !isPause ? (
        <Video
          controls
          style={styles.image}
          source={{ uri: playingUri }}
          onFullscreenPlayerWillDismiss={onClosePlayer}
          paused={isPause}
        />
      ) : thumbNailImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: thumbNailImage }}
          style={[
            styles.image,
            loading ? styles.loadingImage : styles.loadedImage,
          ]}
        />
      ) : (
        <View style={styles.image} />
      )}

      {loading ? (
        <View style={styles.overlay}>
          {isProcess ? (
            <Progress.CircleSnail
              size={24}
              borderColor="transparent"
              thickness={2}
            />
          ) : (
            <Progress.Circle
              progress={progress / 100}
              size={24}
              borderColor="transparent"
              unfilledColor="#ffffff"
              thickness={2}
            />
          )}
        </View>
      ) : isUploadError ? (
        <TouchableOpacity style={styles.overlay} onPress={onRetryUpload}>
          <SvgXml xml={toastIcon()} width="24" height="24" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.closeButton}
          disabled={loading || isProcess}
          onPress={handleDelete}
        >
          <SvgXml xml={closeIcon(theme.colors.base)} width="12" height="12" />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default LoadingVideo;