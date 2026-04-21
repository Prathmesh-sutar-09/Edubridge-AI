import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    marginTop: theme.spacing(4),
  },
  chatArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  paper: {
    height: 400,
    overflowY: 'auto',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  message: {
    display: 'inline-block',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
  },
  userMessage: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  botMessage: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.primary,
  },
  textField: {
    marginRight: theme.spacing(1),
  },
  sidebarButton: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  historyList: {
    maxHeight: 200,
    overflowY: 'auto',
  },
  sidebarToggleButton: {
    position: 'fixed',
    bottom: 20,
    left: 20,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

export default useStyles;
