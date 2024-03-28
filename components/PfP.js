export const PfP = ({ url }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '35pt',
      lineHeight: '7',
      width: '100%',
      height: '100%',
    }}>
      <img
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        src={url}
        alt="Profile Picture"
      />
    </div>
  )
}