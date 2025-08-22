import {
  changeCameraLocation,
  changeCameraTargetLocation,
  updateCameraYaw,
} from '~/features/swarm/slice';
import { addtargetCNF } from '~/features/target/slice';

export const handleIncomeTargetCNF = (message, dispatch) => {
  dispatch(addtargetCNF(message));
};

export const handleIncomeCameraInfo = (message, dispatch) => {
  dispatch(changeCameraLocation(...message.camLocation));
  dispatch(changeCameraTargetLocation(...message.targetLocation));
  dispatch(updateCameraYaw(message.yaw));
};
