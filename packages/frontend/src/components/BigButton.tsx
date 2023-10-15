import { styled, Button } from '@mui/material'

const StyledButton = styled(Button)(
  {
    borderRadius: '500px',
  }
);

function BigButton(props: {
  text: string,
  disabled?: boolean,
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined,
  type?: "submit",
}) {
  return (
    <StyledButton
      variant="contained"
      sx={{ width: '270px' }}
      onClick={props.onClick}
      type={props.type}
      disabled={props.disabled || false}
    >
      {props.text}
    </StyledButton>
  );
}

export default BigButton;