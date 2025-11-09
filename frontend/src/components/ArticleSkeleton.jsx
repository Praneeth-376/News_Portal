export const ArticleSkeleton = ({ count = 6 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {skeletons.map((index) => (
        <div
          key={index}
          style={{
            background: '#f8fafc',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <div style={{ 
            height: '200px', 
            background: '#e2e8f0',
            position: 'relative'
          }}></div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              height: '12px',
              background: '#e2e8f0',
              marginBottom: '8px',
              borderRadius: '4px'
            }}></div>
            <div style={{
              height: '16px',
              background: '#e2e8f0',
              marginBottom: '12px',
              borderRadius: '4px'
            }}></div>
            <div style={{
              height: '14px',
              background: '#e2e8f0',
              marginBottom: '8px',
              borderRadius: '4px'
            }}></div>
            <div style={{
              height: '14px',
              background: '#e2e8f0',
              marginBottom: '12px',
              borderRadius: '4px',
              width: '70%'
            }}></div>
            <div style={{
              height: '1px',
              background: '#e2e8f0',
              marginTop: '12px'
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};