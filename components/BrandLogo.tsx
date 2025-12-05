import React from 'react';

interface BrandLogoProps {
  variant?: 'hero' | 'navbar' | 'icon';
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'hero', className = '' }) => {
  const isNavbar = variant === 'navbar';
  const isHero = variant === 'hero';
  
  // Cor exata extraída da imagem (Bronze/Café)
  const color = "#6F4E37"; 

  // Ajuste do ViewBox dependendo se queremos a logo completa ou só o ícone
  const viewBox = isHero ? "0 0 600 450" : "0 0 600 600";

  return (
    <svg 
      viewBox={viewBox} 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        filter: isHero ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' : 'none' 
      }}
    >
      {/* Background Branco para Navbar para garantir leitura */}
      {isNavbar && <rect width="600" height="600" fill="white" rx="50" />}

      {/* Grupo Centralizado */}
      <g transform={isNavbar ? "translate(300, 300) scale(0.9)" : "translate(300, 200)"}>
        
        {/* Monograma LS Entrelaçado */}
        <g transform="translate(0, 0)">
           <text 
            x="-25" 
            y="20" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontFamily="'Playfair Display', serif" 
            fontSize="280" 
            fill={color}
            style={{ letterSpacing: '-0.05em' }}
          >
            L
          </text>
          <text 
            x="35" 
            y="55" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontFamily="'Playfair Display', serif" 
            fontStyle="italic" 
            fontSize="280" 
            fill={color}
          >
            S
          </text>
        </g>

        {/* Nome do Studio - Exibido no Hero ou na Navbar se for grande o suficiente (mas geralmente navbar usa texto HTML ao lado) */}
        {(isHero) && (
          <text 
            x="0" 
            y="200" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontFamily="'Playfair Display', serif" 
            fontSize="52" 
            fill={color}
            letterSpacing="0.05em"
          >
            L'ESSENCE STUDIO
          </text>
        )}

        {/* Assinatura "by Manu Castro & Etalice Felix" - Apenas no Hero */}
        {isHero && (
          <text 
            x="0" 
            y="260" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontFamily="'Pinyon Script', cursive" 
            fontSize="42" 
            fill={color}
          >
            by Manu Castro & Etalice Felix
          </text>
        )}
      </g>
    </svg>
  );
};

export default BrandLogo;