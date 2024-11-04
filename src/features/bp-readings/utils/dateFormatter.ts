import { format } from 'date-fns';

const dateFormat = 'yyyy-MM-dd:HH:mm';

export const dateFormatter = (value: string) => {
	return format(new Date(value), dateFormat);
};
