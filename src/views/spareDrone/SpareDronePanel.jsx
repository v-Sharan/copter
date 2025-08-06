import React, { Fragment, useState, useRef, useEffect } from 'react';
import {
  MenuItem,
  Select,
  Button,
  FormControl,
  InputLabel,
  Input,
} from '@material-ui/core';
import messageHub from '~/message-hub';
import store from '~/store';
import { showNotification } from '~/features/snackbar/actions';
import { MessageSemantics } from '~/features/snackbar/types';
import LongPressButton from '~/components/button/LongPressButton';

const isAppsink = Boolean(window.bridge?.getGstPipeline);

const { dispatch } = store;

const video = [
  {
    id: 1,
    name: 'Camera 1',
    url: 'http://127.0.0.1:5000/video/1',
    ip: '192.168.6.121',
  },
  {
    id: 2,
    name: 'Camera 2',
    url: 'http://127.0.0.1:5000/video/2',
    ip: '192.168.6.122',
  },
  {
    id: 3,
    name: 'Camera 3',
    url: 'http://127.0.0.1:5000/video/3',
    ip: '192.168.6.123',
  },
];

function getUrlByIp(ip) {
  const foundObject = video.find((item) => item.ip === ip);
  return foundObject ? foundObject.url : null;
}

const SpareDronePanel = () => {
  const [gimbal, setGimbal] = useState(video[0].ip);
  const [camUrl, setCamUrl] = useState(video[0].url);
  // const [gimbalControl, setGimbalControl] = useState();
  // const [record, setRecording] = useState(false);
  const imgRef = useRef(null);

  // useEffect(() => {
  //   (async () => {
  //     if (isAppsink) {
  //       await window.bridge?.getGstPipeline();
  //     }
  //   })();
  // }, []);

  const onCameraChange = async ({ target }) => {
    const rtspurl = getUrlByIp(target.value);
    setCamUrl(rtspurl);
    setGimbal(target.value);
  };

  const onButtonPress = async (msg) => {
    // if (allCamera) return;
    try {
      const res = await messageHub.sendMessage({
        type: 'X-Camera-MISSION',
        message: msg,
        ip: gimbal,
      });

      if (!Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${msg} Message Failed`,
            semantics: MessageSemantics.ERROR,
          })
        );
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: `${e} Command is Failed`,
          semantics: MessageSemantics.ERROR,
        })
      );
    }
  };

  const handleDoubleClick = async (event) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Calculate center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Custom coordinate system: center is (0,0)
    const customX = x - centerX; // Right is negative, Left is positive
    const customY = y - centerY; // Up is negative, Down is positive

    try {
      const res = await messageHub.sendMessage({
        type: 'X-Camera-MISSION',
        message: 'track',
        x: customX,
        y: customY,
        ip: '192.168.0.119',
      });
      if (!Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `Track Message Failed`,
            semantics: MessageSemantics.ERROR,
          })
        );
      } else {
        if (!Boolean(res?.body?.message)) {
          dispatch(
            showNotification({
              message: `Track Message Success`,
              semantics: MessageSemantics.SUCCESS,
            })
          );
        }
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: `${e} Command is Failed`,
          semantics: MessageSemantics.ERROR,
        })
      );
    }
  };

  console.log('Camera Urllllllll', `${camUrl}?random=${Math.random()}`);

  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          alignSelf: 'center',
          gap: 10,
        }}
      >
        <FormControl>
          {/* <InputLabel id='demo-simple-select-label'>Ip</InputLabel>
          <Input value={gimbal} onChange={() => {}} /> */}
          <Select
            id='demo-simple-select-label'
            onChange={onCameraChange}
            value={gimbal}
          >
            {video.map(({ id, ip, name, url }) => (
              <MenuItem value={ip} name={name}>
                {ip}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <Button
          onClick={async () => {
            if (isAppsink) {
              await window.bridge?.getGstPipeline();
            }
          }}
        >
          Start Camera
        </Button> */}
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'zoom_in')}
          onLongPressEnd={onButtonPress.bind(this, 'zoom_stop')}
        >
          Zoom in
        </LongPressButton>
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'zoom_out')}
          onLongPressEnd={onButtonPress.bind(this, 'zoom_stop')}
        >
          Zoom out
        </LongPressButton>
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'up')}
          onLongPressEnd={onButtonPress.bind(this, 'stop')}
        >
          Up
        </LongPressButton>
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'left')}
          onLongPressEnd={onButtonPress.bind(this, 'stop')}
        >
          Left
        </LongPressButton>
        <Button onClick={onButtonPress.bind(this, 'home')}>HOME</Button>
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'right')}
          onLongPressEnd={onButtonPress.bind(this, 'stop')}
        >
          RIGHT
        </LongPressButton>
        <LongPressButton
          onLongPress={onButtonPress.bind(this, 'down')}
          onLongPressEnd={onButtonPress.bind(this, 'stop')}
        >
          Down
        </LongPressButton>
        <Button
          onClick={() => {
            onButtonPress('start_record');
            setRecording(true);
          }}
        >
          Start Recording
        </Button>
        <Button
          onClick={() => {
            onButtonPress('stop_record');
            setRecording(false);
          }}
        >
          Stop Recording
        </Button>
        <Button
          onClick={async () => {
            await window.bridge?.getGstPipeline();
          }}
        >
          Camera gstreamer
        </Button>
      </div>
      {/* <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          // ref={imgRef}
          // src='http://localhost:9000/stream'
          src={`${camUrl}?random=${Math.random()}`}
          style={{
            width: '1280px',
            height: '720px',
            objectFit: 'cover',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            margin: '5px',
          }}
          // src={require('../../../assets/error.jpg')}
          alt='RTSP Stream'
          // onDoubleClick={handleDoubleClick}
        />
      </div> */}
    </Fragment>
  );
};

export default SpareDronePanel;
