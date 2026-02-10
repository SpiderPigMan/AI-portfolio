import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExperienciaPage from '../page';

// 1. MOCK ROBUSTO PARA FRAMER MOTION
// Aseguramos que los componentes motion rendericen sus hijos inmediatamente
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
      h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    },
  };
});

describe('ExperienciaPage - Bento Grid', () => {
  it('debe renderizar los 4 bloques de experiencia iniciales', () => {
    render(<ExperienciaPage />);
    // Usamos getAllByRole con un nombre accesible si es posible, o genérico
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(4);
    expect(screen.getByText(/Orange/i)).toBeInTheDocument();
  });

  it('debe abrir el modal con detalles al hacer clic en una tarjeta', async () => {
    render(<ExperienciaPage />);
    
    // Buscamos una tarjeta específica
    const triggerCard = screen.getByText(/Senior Fullstack Developer/i);
    fireEvent.click(triggerCard);

    // 2. CURA: waitFor
    // Esperamos a que el estado cambie y el modal aparezca en el DOM
    await waitFor(() => {
      expect(screen.getByText(/Logros Clave/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Reducción del 40%/i)).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer clic en el botón de cierre', async () => {
    render(<ExperienciaPage />);
    
    // Abrimos
    fireEvent.click(screen.getByText(/Senior Fullstack Developer/i));
    
    // Esperamos a que abra
    await waitFor(() => {
      expect(screen.getByText(/Logros Clave/i)).toBeInTheDocument();
    });
    
    // Cerramos
    // Buscamos el botón de cierre (X) que suele ser el único botón en el modal
    const closeButtons = screen.getAllByRole('button');
    // El último botón suele ser el del modal si está superpuesto, o buscamos por clase si fuera necesario
    const closeButton = closeButtons[0]; 
    
    fireEvent.click(closeButton);

    // Esperamos a que desaparezca
    await waitFor(() => {
      expect(screen.queryByText(/Logros Clave/i)).not.toBeInTheDocument();
    });
  });
});