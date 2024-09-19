import { Box, Button, Modal, Typography } from "@mui/material";

interface ProofofWorkModalInterface {
  show: boolean;
  targetDifficulty: number;
  onCancel:() => void;
  progress: {
    numHashes: number;
    maxDifficultyAchieved: number;
  }
}

export const ProofofWorkModal: React.FC<ProofofWorkModalInterface> = ({
  show,
  targetDifficulty,
  onCancel,
  progress
}) => {

  const cancelMining = () => {
    onCancel()
  };

  return (
    <Modal open={show} style={{ top: "15%", maxWidth: "80%", left: "10%" }}>
      <div>
        <h3 style={{ color: "#FAD13F" }}>Proof Of Work</h3>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "black",
            backgroundColor: "white",
            minHeight: 400,
          }}
        >
          <Typography>Calculating Proof of Work</Typography>
          <p style={{ margin: "5%" }}>
            <Typography>
              This poll requires users to attach "Proof of Work" on their
              responses.{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://en.wikipedia.org/wiki/Proof_of_work"
                style={{ color: "orange" }}
              >
                Proof of Work(PoW)
              </a>{" "}
              is a spam control mechanism that allows for more trust in
              anonymous votes. It is achieved by adding a proof of compute from
              your device to your response.
            </Typography>
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography> target difficulty: {targetDifficulty}</Typography>
            <Typography>
              {" "}
              difficulty achieved so far: {progress.maxDifficultyAchieved}
            </Typography>
            <Typography> hashes computed: {progress.numHashes}</Typography>
          </div>

          <Button
            onClick={cancelMining}
            variant="contained"
            style={{ margin: 10 }}
          >
            Cancel
          </Button>
        </Box>
      </div>
    </Modal>
  );
};
