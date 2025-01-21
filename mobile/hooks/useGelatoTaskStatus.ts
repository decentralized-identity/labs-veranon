import { useState } from 'react';
import { checkTaskStatus } from '../utils/gelatoRelayRequest';

export enum TaskState {
  CheckPending = "CheckPending",
  ExecPending = "ExecPending",
  WaitingForConfirmation = "WaitingForConfirmation",
  ExecSuccess = "ExecSuccess",
  ExecReverted = "ExecReverted",
  Cancelled = "Cancelled",
}

export function useTaskStatus() {
  const [verificationStatus, setVerificationStatus] = useState<string>('');

  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await checkTaskStatus(taskId);
        if (!status) {
          setVerificationStatus('No status returned');
          return;
        }
        
        switch (status.taskState) {
          case TaskState.CheckPending:
            setVerificationStatus('Verifying Submission...');
            break;

          case TaskState.ExecPending:
            setVerificationStatus('Waiting for finalization...');
            break;

          case TaskState.WaitingForConfirmation:
            setVerificationStatus(
              status.transactionHash 
                ? `Submission approved. Waiting for confirmations...`
                : 'Waiting for approval...'
            );
            break;

          case TaskState.ExecSuccess:
            setVerificationStatus(
              `Verification successful!`
            );
            clearInterval(pollInterval);
            break;

          case TaskState.ExecReverted:
            setVerificationStatus(
              `Submission failed. Please try again.`
            );
            console.log("ExecReverted", status.lastCheckMessage);
            clearInterval(pollInterval);
            break;

          case TaskState.Cancelled:
            setVerificationStatus(
              `Submission cancelled. Please try again.`
            );
            console.log("Cancelled", status.lastCheckMessage);
            clearInterval(pollInterval);
            break;

          default:
            setVerificationStatus(`Unknown status: ${status.taskState}`);
            break;
        }
        
      } catch (error) {
        console.error('Status check failed:', error);
        setVerificationStatus('Failed to check transaction status');
        clearInterval(pollInterval);
      }
    }, 3000);
  };

  return {
    verificationStatus,
    setVerificationStatus,
    pollTaskStatus
  };
}