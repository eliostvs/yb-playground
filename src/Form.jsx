import React from "react"
import PropTypes from "prop-types"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"

const sections = [
  {
    name: "Account",
    fields: [
      {
        name: "accountCode",
        label: "Code",
        required: true,
        type: "text",
        props: {
          placeholder: "NicePeopleAtWork customer account code",
        },
      },
      {
        name: "content-transactionCode",
        label: "Transaction",
        required: true,
        type: "component",
        component: TransactionCodeField,
      },
    ],
  },
  {
    name: "Plugin",
    fields: [
      {
        name: "enabled",
        label: "Enable",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
        },
      },
      {
        name: "$pluginVersion",
        label: "Version",
        required: true,
        type: "text",
        props: {
          placeholder: "0.0.1",
          defaultValue: "0.0.1",
        },
      },
      {
        name: "$playerName",
        label: "Player Name",
        required: true,
        type: "text",
        props: {
          placeholder: "Name",
          defaultValue: "Playground",
        },
      },
      {
        name: "$playerVersion",
        label: "Player Version",
        required: true,
        type: "text",
        props: {
          placeholder: "0.0.1",
          defaultValue: "0.0.1",
        },
      },
    ],
  },
  {
    name: "Media",
    fields: [
      {
        name: "content-title",
        label: "Title",
        required: true,
        type: "text",
        props: {
          placeholder: "Title of the media",
          defaultValue: "Sintel",
        },
      },
      {
        name: "content-title2",
        label: "Program",
        required: false,
        type: "text",
        props: {
          placeholder: "Secondary title of the media",
        },
      },
      {
        name: "content-resource",
        label: "Resource",
        required: true,
        type: "text",
        props: {
          placeholder: "URL/path of the current media resource",
          defaultValue:
            "https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd",
        },
      },
      {
        name: "content-duration",
        label: "Duration (s)",
        required: true,
        type: "number",
        props: {
          min: "60",
          max: "3599",
          defaultValue: "60",
          step: "60",
        },
      },
      {
        name: "content-isLive",
        label: "Is Live",
        required: false,
        type: "boolean",
        props: {
          placeholder: "True if the content is live false if VOD",
        },
      },
      {
        name: "content-cdn",
        label: "CDN",
        required: false,
        type: "text",
        props: { placeholder: "Codename of the CDN" },
      },
      {
        name: "content-cdnNode",
        label: "CDN Node",
        required: false,
        type: "text",
        props: {
          placeholder: "CDN node id",
        },
      },
      {
        name: "content-cdnType",
        label: "CDN Node",
        required: false,
        type: "text",
        props: {
          placeholder: "CDN node type",
        },
      },
      {
        name: "content-bitrate",
        label: "Bitrate per second",
        type: "number",
        required: false,
        props: {
          min: "0",
          step: "4",
        },
      },
      {
        name: "content-fps",
        label: "Frames per second",
        required: false,
        type: "number",
        props: {
          min: "0",
        },
      },
      {
        name: "content-metadata",
        label: "Metadata",
        required: false,
        type: "text",
        props: {
          placeholder:
            "Item containing mixed extra information about the content",
        },
      },
      {
        name: "content-rendition",
        label: "Rendition",
        required: false,
        type: "text",
        props: {
          placeholder: "Name of the current rendition of the content",
        },
      },
      {
        name: "content-streamingProtocol",
        label: "Streaming Protocol",
        required: false,
        type: "select",
        options: [
          { name: "", code: "" },
          { name: "HDS", code: "HDS" },
          { name: "HLS", code: "HLS" },
          { name: "MSS", code: "MSS" },
          { name: "DASH", code: "DASH" },
          { name: "RTMP", code: "RTMP" },
          { name: "RTP", code: "RTP" },
          { name: "RTSP", code: "RTSP" },
        ],
        props: {
          placeholder: "Name of the streaming media protocol",
        },
      },
      {
        name: "content-throughput",
        label: "Throughput per second",
        required: false,
        type: "number",
      },
    ],
  },
  {
    name: "Ads",
    fields: [
      {
        name: "ad-resource",
        label: "Resource",
        required: false,
        type: "text",
        props: {
          placeholder: "Resource URL",
        },
      },
      {
        name: "ad-title",
        label: "Title",
        required: false,
        type: "text",
        props: {
          placeholder: "Resource Title",
        },
      },
      {
        name: "ad-campaign",
        label: "Campaign",
        required: false,
        type: "text",
        props: {
          placeholder: "Name of the campaign",
        },
      },
      {
        name: "$adsDuration",
        label: "Duration (s)",
        required: false,
        type: "number",
        props: {
          min: 10,
          max: 120,
          defaultValue: 10,
        },
      },
      {
        name: "$adsVersion",
        label: "Version",
        required: false,
        type: "text",
        props: {
          placeholder: "Ads adapter version",
          defaultValue: "0.0.1",
        },
      },
      {
        name: "ad-ignore",
        label: "Ignore Join Time",
        required: false,
        type: "boolean",
        props: {
          placeholder: "Ignores ad time in the join time",
          defaultValue: false,
        },
      },
      {
        name: "$adsClickThroughURL",
        label: "Click-through URL",
        required: false,
        type: "text",
        props: {
          placeholder: "example.com",
        },
      },
      {
        name: "$adsIsVisible",
        label: "Visible",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: true,
        },
      },
      {
        name: "$adsIsSkippable",
        label: "Skippable",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: true,
        },
      },
      {
        name: "$adsIsFullScreen",
        label: "Fullscreen",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
        },
      },
      {
        name: "$adsAudioEnabled",
        label: "Audio enabled",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
        },
      },
      {
        name: "ad-metadata",
        label: "Metadata",
        required: false,
        type: "text",
        props: {
          placeholder: "Mixed extra information about ads like",
        },
      },
      {
        name: "ad-creativeId",
        label: "Creative",
        required: false,
        type: "text",
        props: {
          placeholder: "Creative code",
        },
      },
      {
        name: "ad-provider",
        label: "Provider",
        required: false,
        type: "text",
        props: {
          placeholder: "Provider code",
        },
      },
      {
        name: "ad-extraparam-1",
        label: "Extra 1",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 1",
        },
      },
      {
        name: "ad-extraparam-2",
        label: "Extra 2",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 2",
        },
      },
      {
        name: "ad-extraparam-3",
        label: "Extra 3",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 3",
        },
      },
      {
        name: "ad-extraparam-4",
        label: "Extra 4",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 4",
        },
      },
      {
        name: "ad-extraparam-5",
        label: "Extra 5",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 5",
        },
      },
      {
        name: "ad-extraparam-6",
        label: "Extra 6",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 6",
        },
      },
      {
        name: "ad-extraparam-7",
        label: "Extra 7",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 7",
        },
      },
      {
        name: "ad-extraparam-8",
        label: "Extra 8",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 8",
        },
      },
      {
        name: "ad-extraparam-9",
        label: "Extra 9",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 9",
        },
      },
      {
        name: "ad-extraparam-10",
        label: "Extra 10",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 10",
        },
      },
    ],
  },
  {
    name: "Extra Params",
    fields: [
      {
        name: "extraparam-1",
        label: "Extra 1",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 1",
        },
      },
      {
        name: "extraparam-2",
        label: "Extra 2",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 2",
        },
      },
      {
        name: "extraparam-3",
        label: "Extra 3",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 3",
        },
      },
      {
        name: "extraparam-4",
        label: "Extra 4",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 4",
        },
      },
      {
        name: "extraparam-5",
        label: "Extra 5",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 5",
        },
      },
      {
        name: "extraparam-6",
        label: "Extra 6",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 6",
        },
      },
      {
        name: "extraparam-7",
        label: "Extra 7",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 7",
        },
      },
      {
        name: "extraparam-8",
        label: "Extra 8",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 8",
        },
      },
      {
        name: "extraparam-9",
        label: "Extra 9",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 9",
        },
      },
      {
        name: "extraparam-10",
        label: "Extra 10",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 10",
        },
      },
      {
        name: "extraparam-11",
        label: "Extra 11",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 11",
        },
      },
      {
        name: "extraparam-12",
        label: "Extra 12",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 12",
        },
      },
      {
        name: "extraparam-13",
        label: "Extra 13",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 13",
        },
      },
      {
        name: "extraparam-14",
        label: "Extra 14",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 14",
        },
      },
      {
        name: "extraparam-15",
        label: "Extra 15",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 15",
        },
      },
      {
        name: "extraparam-16",
        label: "Extra 16",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 16",
        },
      },
      {
        name: "extraparam-17",
        label: "Extra 17",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 17",
        },
      },
      {
        name: "extraparam-18",
        label: "Extra 18",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 18",
        },
      },
      {
        name: "extraparam-19",
        label: "Extra 19",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 19",
        },
      },
      {
        name: "extraparam-20",
        label: "Extra 20",
        required: false,
        type: "text",
        props: {
          placeholder: "Custom parameter 20",
        },
      },
    ],
  },
  {
    name: "Session",
    fields: [
      {
        name: "username",
        label: "User ID",
        required: false,
        type: "text",
        props: {
          placeholder: "User ID value inside your system",
        },
      },
      {
        name: "userType",
        label: "User Type",
        required: false,
        type: "text",
        props: {
          placeholder: "User type",
        },
      },
      {
        name: "device-code",
        label: "Code",
        required: false,
        type: "text",
        props: {
          placeholder: "Youbora's device code",
        },
      },
    ],
  },
  {
    name: "Parse",
    fields: [
      {
        name: "parse-manifest",
        label: "Manifest",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
          placeholder: "Parse manifest files",
        },
      },
      {
        name: "parse-cdnNode",
        label: "CDN Node",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
          placeholder: "Query the CDN to retrieve the node name",
        },
      },
      {
        name: "parse-CdnNameHeader",
        label: "CDN Name Header",
        required: false,
        type: "text",
        props: {
          placeholder: "Fetch the CDN code from the custom header",
        },
      },
    ],
  },
  {
    name: "Network",
    fields: [
      {
        name: "host",
        label: "Host",
        required: false,
        type: "text",
        props: {
          placeholder: "Host of the Fastdata service",
        },
      },
      {
        name: "app-https",
        label: "HTTPS",
        required: false,
        type: "boolean",
        props: {
          placeholder: "Use https",
        },
      },
      {
        name: "network-connectionType",
        label: "Connection Type",
        required: false,
        type: "select",
        options: [
          { name: "", code: "" },
          { name: "Dialup", code: "dialup" },
          { name: "Cable/DSL", code: "cable/dsl" },
          { name: "Cellular", code: "celullar" },
          { name: "Corporate", code: "corporate" },
        ],
        props: {
          placeholder: "Connection type code",
        },
      },
      {
        name: "network-ip",
        label: "IP",
        required: false,
        type: "text",
        props: {
          placeholder: "IP of the viewer/user",
        },
      },
      {
        name: "network-isp",
        label: "ISP",
        required: false,
        type: "text",
        props: {
          placeholder: "Name of the internet service provider",
        },
      },
      {
        name: "user-obfuscateIp",
        label: "Obfuscated IP",
        required: false,
        type: "boolean",
        props: {
          defaultChecked: false,
          placeholder: "Obfuscated the IP address",
        },
      },
    ],
  },
]

function Section(props) {
  return (
    <section className="flex flex-col col-span-1 shadow-md md:col-span-2 lg:col-span-1 md:row-span-2">
      <header className="shadow">
        <h1 className="p-4 text-lg font-semibold tracking-wide text-gray-900 sm:text-2xl">
          Plugin Options
        </h1>
      </header>

      <Form {...props} />
    </section>
  )
}

function Form({ onSubmit, onReset, disabled }) {
  const methods = useForm()

  function reset() {
    onReset(methods.reset)
  }

  return (
    <FormProvider {...methods} disabled={disabled}>
      <form
        id="optionsForm"
        className={`overflow-y-auto ${disabled && "opacity-50"}`}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="px-6 mb-4">{sections.map(FieldSection)}</div>
      </form>

      <footer className="flex justify-end gap-4 px-8 py-4 shadow">
        <ResetButton disabled={disabled} reset={reset} />
        <StartButton disabled={disabled} />
      </footer>
    </FormProvider>
  )
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
}

function ResetButton({ disabled, reset }) {
  const extraStyle = disabled
    ? "text-gray-500 cursor-not-allowed"
    : "text-gray-700"

  return (
    <button
      onClick={reset}
      className={`px-6 py-4 text-sm font-medium leading-5 tracking-wide uppercase transition duration-150 ease-in-out border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 ${extraStyle}`}
    >
      reset
    </button>
  )
}

ResetButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
}

function StartButton({ disabled }) {
  const extraStyle = disabled
    ? "bg-indigo-500 cursor-not-allowed"
    : "bg-indigo-600 "

  return (
    <button
      type="submit"
      form="optionsForm"
      className={`px-6 py-4 text-sm font-medium leading-5 tracking-wide text-white uppercase transition duration-150 ease-in-out border border-transparent rounded-md hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 ${extraStyle}`}
    >
      start
    </button>
  )
}

StartButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
}

const FieldPropTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  props: PropTypes.object,
}

function FieldSection({ name, fields }) {
  return (
    <div key={name} className="pt-8 mt-8 border-t border-gray-200 first:mt-0">
      <div>
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {name}
          </h3>
        </div>

        <div>{fields.map(Field)}</div>
      </div>
    </div>
  )
}

FieldSection.propTypes = {
  name: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape(FieldPropTypes)).isRequired,
}

function Field({ type, ...props }) {
  switch (type) {
    case "text": {
      return <TextField key={props.name} {...props} />
    }
    case "number": {
      return <NumberField key={props.name} {...props} />
    }
    case "boolean": {
      return <CheckboxField key={props.name} {...props} />
    }
    case "select": {
      return <SelectField key={props.name} {...props} />
    }
    case "component": {
      return <props.component key={props.name} />
    }
    default: {
      throw Error(`Field type ${type} not mapped!`)
    }
  }
}

function TextField({ name, label, required, props }) {
  const { register, errors, disabled } = useFormContext()

  return (
    <FieldContainer>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <FieldSet disabled={disabled}>
        <input
          {...props}
          ref={register({ required })}
          name={name}
          id={name}
          className="block w-full pr-10 text-sm leading-5 rounded shadow-sm form-input"
        />
        <ErrorIcon name={name} errors={errors} />
      </FieldSet>
    </FieldContainer>
  )
}

TextField.propTypes = FieldPropTypes

function NumberField({ name, label, required, props }) {
  const { register, errors, disabled } = useFormContext()

  return (
    <FieldContainer>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <FieldSet disabled={disabled}>
        <input
          {...props}
          ref={register({ required })}
          id={name}
          name={name}
          type="number"
          className="block w-1/2 text-sm leading-5 rounded-md shadow-sm form-input"
        />
        <ErrorIcon name={name} errors={errors} />
      </FieldSet>
    </FieldContainer>
  )
}

NumberField.propTypes = FieldPropTypes

function CheckboxField({ name, label, required, props }) {
  const { register, errors, disabled } = useFormContext()

  return (
    <FieldContainer>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <FieldSet disabled={disabled}>
        <input
          {...props}
          ref={register({ required })}
          type="checkbox"
          id={name}
          name={name}
          className="block w-4 h-4 text-sm leading-5 shadow-sm form-checkbox"
        />
        <ErrorIcon name={name} errors={errors} />
      </FieldSet>
    </FieldContainer>
  )
}

CheckboxField.propTypes = FieldPropTypes

function SelectField({ name, label, required, options }) {
  const { register, errors, disabled } = useFormContext()

  return (
    <FieldContainer>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <FieldSet disabled={disabled}>
        <select
          ref={register({ required })}
          id={name}
          name={name}
          className="block w-full text-sm leading-5 rounded-md shadow-sm form-select"
        >
          {options.map((option) => (
            <Option key={option.code} {...option} />
          ))}
        </select>
        <ErrorIcon name={name} errors={errors} />
      </FieldSet>
    </FieldContainer>
  )
}

const OptionPropTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}

SelectField.propTypes = {
  ...FieldPropTypes,
  options: PropTypes.arrayOf(PropTypes.shape(OptionPropTypes)).isRequired,
}

function Option({ code, name }) {
  return <option value={code}>{name}</option>
}

Option.propTypes = OptionPropTypes

function ErrorIcon({ name, errors }) {
  return (
    <>
      {errors[name] && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <SmallErrorIcon />
        </div>
      )}
    </>
  )
}

ErrorIcon.propTypes = {
  name: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
}

function SmallErrorIcon() {
  return (
    <svg
      className="w-5 h-5 text-red-500"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function FieldContainer({ children }) {
  return (
    <div className="grid items-center mt-4 sm:grid-cols-3 sm:pt-5">
      {children}
    </div>
  )
}

FieldContainer.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block grid-cols-1 text-sm font-medium leading-5 text-gray-700"
    >
      {children}
    </label>
  )
}

Label.propTypes = {
  htmlFor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

function FieldSet({ children, disabled }) {
  return (
    <fieldset className="relative col-span-2 mt-1" disabled={disabled}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          ...child.props,
          className: `${child.props.className} ${
            disabled && "cursor-not-allowed"
          }`,
        })
      )}
    </fieldset>
  )
}

FieldSet.propTypes = {
  disabled: PropTypes.bool.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
}

function TransactionCodeField() {
  const [value, setValue] = React.useState(uuidv4())
  const { register, errors, disabled } = useFormContext()

  function reloadUUID() {
    setValue(uuidv4())
    delete errors["content-transactionCode"]
  }

  return (
    <FieldContainer style="sm:grid-cols-4">
      <Label htmlFor="content-transactionCode">Transaction *</Label>
      <FieldSet disabled={disabled}>
        <input
          className="block w-full pr-10 text-sm leading-5 rounded shadow-sm form-input"
          id="content-transactionCode"
          name="content-transactionCode"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Custom unique code to identify the view"
          ref={register({ required: true })}
          value={value}
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500"
          onClick={reloadUUID}
        >
          {errors["content-transactionCode"] ? (
            <SmallErrorIcon />
          ) : (
            <SmallReloadIcon />
          )}
        </div>
      </FieldSet>
    </FieldContainer>
  )
}

function SmallReloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="w-5 h-5"
      fill="currentColor"
    >
      <path d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42 1.42zM12 10h8l-4 4-4-4z" />
    </svg>
  )
}

export { Section }
