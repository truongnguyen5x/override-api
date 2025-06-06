import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Textarea,
  createListCollection
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@components/ui/select";
import styles from "./style.module.scss";

const CreateOverride = ({
  detail,
  open,
  form,
  handleAdd,
  handleUpdate,
  selectedOverride,
  onImport
}) => {
  const { control, handleSubmit } = form;

  const refInput = useRef();

  useEffect(() => {
    form.reset({ ...detail });
    console.log(detail);
  }, [detail]);

  const handleExport = () => {
    chrome.storage.local.get("overrides", function (v) {
      console.log(v.overrides);
      const res = JSON.stringify(v.overrides, null, 2);

      // Tạo Blob từ biến res
      const blob = new Blob([res], { type: "text/plain" });

      // Tạo URL từ Blob
      const url = URL.createObjectURL(blob);

      // Lấy thời gian hiện tại và định dạng nó
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `overrides_${timestamp}.json`;

      // Tạo thẻ <a> để tải xuống
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Tên file tải xuống với timestamp
      document.body.appendChild(a);

      // Kích hoạt sự kiện click để tải xuống
      a.click();

      // Xóa thẻ <a> sau khi tải xuống
      document.body.removeChild(a);

      // Giải phóng URL
      URL.revokeObjectURL(url);
    });
  };

  const handleImport = () => {
    refInput.current.click();
  };

  const onFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target.result;
        const fileObject = JSON.parse(fileContent);

        try {
          chrome.storage.local.set(
            {
              overrides: fileObject
            },
            function () {
              onImport(fileObject);
              console.log("Items update:", fileObject);
            }
          );
        } catch (error) {
          console.log(error);
        }
      };

      reader.readAsText(file); // Đọc file dưới dạng text
    }
  };

  return (
    <Flex gap="4" my="4">
      <Box>
        <Controller
          name={`url`}
          control={control}
          render={({ field }) => (
            <Input
              minWidth="300px"
              type="text"
              placeholder="Enter URL"
              {...field}
            />
          )}
        />
        <Flex gap="3" mt="4">
          <Controller
            name={`method`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <SelectRoot
                value={[value]}
                onValueChange={(e) => onChange(e.value?.[0])}
                collection={methods}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {methods.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            )}
          />
          <Controller
            name={`status`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <SelectRoot
                value={[value]}
                onValueChange={(e) => onChange(e.value?.[0])}
                collection={statuses}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            )}
          />
        </Flex>
        <Flex gap={"3"} mt="4">
          <Button variant="solid" colorPalette="black" onClick={handleAdd}>
            Add
          </Button>
          <Button
            variant="solid"
            colorPalette="black"
            onClick={handleUpdate}
            disabled={!selectedOverride}
          >
            Update
          </Button>
        </Flex>
        <Flex gap={"3"} mt="4">
          <Button variant="solid" colorPalette="black" onClick={handleExport}>
            Export
          </Button>
          <Button variant="solid" colorPalette="black" onClick={handleImport}>
            Import
          </Button>
        </Flex>
      </Box>

      {/* <Controller
        name={`json`}
        control={control}
        render={({ field: { value, onChange } }) => (
          <Textarea
            width="unset"
            minWidth="300px" // Đặt chiều rộng tối thiểu
            resize="both" // Cho phép thay đổi kích thước theo chiều dọc
            placeholder="Enter JSON"
            {...field}
          />
        )}
      /> */}

      <div className={styles.textArea} id="json-area"></div>
      <input
        style={{ display: "none" }}
        type="file"
        ref={refInput}
        onChange={onFileUpload}
      />
    </Flex>
  );
};

export default CreateOverride;

const methods = createListCollection({
  items: [
    { label: "GET", value: "GET" },
    { label: "POST", value: "POST" },
    { label: "PUT", value: "PUT" },
    { label: "DELETE", value: "DELETE" }
  ]
});

const statuses = createListCollection({
  items: [
    { label: "200", value: "200" },
    { label: "400", value: "400" },
    { label: "401", value: "401" },
    { label: "500", value: "500" }
  ]
});
