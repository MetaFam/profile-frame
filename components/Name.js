export const Name = ({ name }) => {
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
      <p>What’s your name?</p>
      <p>{name}?</p>
    </div>
  
  )
}