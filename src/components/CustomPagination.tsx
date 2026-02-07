import Pagination from "rc-pagination";
import { twMerge } from "tailwind-merge";
import "rc-pagination/assets/index.css";

const defaultClassName = "flex justify-center items-center";

interface CustomPaginationProps {
  total: number;
  pageSize: number;
  current: number;
  onChange: (page: number) => void;
  className?: string;
}

const CustomPagination = ({
  total,
  pageSize,
  current,
  onChange,
  className,
}: CustomPaginationProps) => {
  return (
    <div className="flex justify-end items-center p-2 w-full">
      <Pagination
        total={total}
        pageSize={pageSize}
        current={current}
        onChange={onChange}
        className={twMerge(defaultClassName, className || "")}
      />
    </div>
  );
};

export default CustomPagination;
