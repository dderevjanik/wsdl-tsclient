import { generateClient } from "../src";

(async function name() {
    await generateClient("./test/resources/Dummy.wsdl", "./test/generated/Dummy");
    await generateClient("./test/resources/array_namespace_override.wsdl", "./test/generated/array_namespace_override");
    await generateClient("./test/resources/attachments.wsdl", "./test/generated/attachments");
    await generateClient("./test/resources/binding-exception.wsdl", "./test/generated/binding-exception");
    await generateClient("./test/resources/binding_document.wsdl", "./test/generated/binding_document");
    await generateClient("./test/resources/builtin_types.wsdl", "./test/generated/builtin_types");
    await generateClient("./test/resources/cross_schema.wsdl", "./test/generated/cross_schema");
    await generateClient("./test/resources/default_namespace.wsdl", "./test/generated/default_namespace");
    await generateClient("./test/resources/default_namespace_soap12.wsdl", "./test/generated/default_namespace_soap12");
    await generateClient("./test/resources/empty_body.wsdl", "./test/generated/empty_body");
    await generateClient("./test/resources/extended_element.wsdl", "./test/generated/extended_element");
    await generateClient("./test/resources/extended_recursive.wsdl", "./test/generated/extended_recursive");
    await generateClient("./test/resources/include_with_duplicated_namespace.wsdl", "./test/generated/include_with_duplicated_namespace");
    await generateClient("./test/resources/json_response.wsdl", "./test/generated/json_response");
    await generateClient("./test/resources/list_parameter.wsdl", "./test/generated/list_parameter");
    await generateClient("./test/resources/marketo.wsdl", "./test/generated/marketo");
    await generateClient("./test/resources/non_identifier_chars_in_operation.wsdl", "./test/generated/non_identifier_chars_in_operation");
    // await generateClient("./test/resources/recursive.wsdl", "./test/generated/recursive");
    await generateClient("./test/resources/recursive2.wsdl", "./test/generated/recursive2");
    await generateClient("./test/resources/redefined-ns.wsdl", "./test/generated/redefined-ns");
    await generateClient("./test/resources/ref_element_same_as_type.wsdl", "./test/generated/ref_element_same_as_type");
    await generateClient("./test/resources/rpcexample.wsdl", "./test/generated/rpcexample");
    await generateClient("./test/resources/self_referencing.wsdl", "./test/generated/self_referencing");
    await generateClient("./test/resources/typeof_null_extend_check.wsdl", "./test/generated/typeof_null_extend_check");
    await generateClient("./test/resources/ws-policy.wsdl", "./test/generated/ws-policy");
})();
