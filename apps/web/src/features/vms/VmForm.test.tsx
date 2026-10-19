import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { VmForm } from './VmForm';

describe('VmForm', () => {
  it('muestra error de RAM negativa junto al campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<VmForm submitLabel="Crear" onSubmit={onSubmit} />);
    const view = within(container);

    const ram = view.getByLabelText('RAM');
    await user.clear(ram);
    await user.type(ram, '-1');

    await waitFor(() => {
      expect(view.getByText(/la ram mínima es 1 gb/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('al enviar con errores muestra todos los mensajes y no envía', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<VmForm submitLabel="Crear" onSubmit={onSubmit} />);
    const view = within(container);

    // El botón no se deshabilita por invalidez: al pulsarlo se explica qué falta.
    await user.click(view.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(view.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
    });
    expect(view.getByLabelText('Nombre')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rechaza nombre demasiado corto', async () => {
    const user = userEvent.setup();
    const { container } = render(<VmForm submitLabel="Crear" onSubmit={vi.fn()} />);
    const view = within(container);

    await user.type(view.getByLabelText('Nombre'), 'ab');

    await waitFor(() => {
      expect(view.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('acepta nombres con ñ y acentos cuando el resto es válido', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <VmForm
        submitLabel="Crear"
        defaultValues={{
          name: 'Ñandú 01',
          cores: 2,
          ram: 4,
          disk: 40,
          os: 'Ubuntu',
          status: 'OFF',
        }}
        onSubmit={vi.fn()}
      />,
    );
    const view = within(container);

    await waitFor(() => {
      expect(view.getByRole('button', { name: 'Crear' })).not.toBeDisabled();
    });

    await user.clear(view.getByLabelText('Nombre'));
    await user.type(view.getByLabelText('Nombre'), 'José');

    await waitFor(() => {
      expect(view.getByRole('button', { name: 'Crear' })).not.toBeDisabled();
    });
  });
});
